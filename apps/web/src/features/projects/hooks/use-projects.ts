'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProjects } from '@/services/project-service'
import {
  createProject,
  updateProject,
  deleteProject,
  updateProjectTags,
} from '@/app/actions/projects'
import type { ProjectFormData } from '@/schemas/project'
import type {
  ProjectStatus,
  PaginationParams,
  PaginatedResponse,
} from '@/types/supabase-helpers'
import type { ProjectFilterParams } from '@/services/project-service'
import type { ProjectListItem } from '@/types/supabase-helpers'

// Query Keys
export const projectsKeys = {
  all: ['projects'] as const,
  lists: () => [...projectsKeys.all, 'list'] as const,
  list: (
    locale: string,
    status: ProjectStatus | null,
    pagination?: PaginationParams,
    filters?: ProjectFilterParams
  ) => [...projectsKeys.lists(), locale, status, pagination, filters] as const,
  details: () => [...projectsKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectsKeys.details(), id] as const,
}

/**
 * Fetch projects with optional filters and pagination
 */
export function useProjects(
  locale: string,
  status: ProjectStatus | null = null,
  pagination?: PaginationParams,
  filters?: ProjectFilterParams
) {
  return useQuery({
    queryKey: projectsKeys.list(locale, status, pagination, filters),
    queryFn: async () => {
      const result = await getProjects(locale, status, pagination, filters)
      return result
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Create a new project with optimistic update
 */
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ProjectFormData) => {
      // Separate tag_ids from main data
      const { tag_ids, ...projectData } = data
      const result = await createProject(projectData)

      // Update tags after project is created
      if (tag_ids && tag_ids.length > 0) {
        await updateProjectTags(result.id, tag_ids)
      }

      return result
    },
    // Optimistic update
    onMutate: async (newProject: ProjectFormData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectsKeys.lists() })

      // Snapshot previous value
      const previousProjects = queryClient.getQueryData<
        PaginatedResponse<ProjectListItem>
      >(projectsKeys.lists())

      // Optimistically update to the new value
      const tempProject = {
        id: `temp-${Date.now()}`,
        ...newProject,
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        locale: 'vi',
        featured: false,
      }

      if (previousProjects) {
        queryClient.setQueryData(projectsKeys.lists(), {
          ...previousProjects,
          data: [tempProject, ...previousProjects.data],
        })
      }

      return { previousProjects: previousProjects ?? null }
    },
    onError: (
      error: Error,
      _newProject: ProjectFormData,
      context?: { previousProjects: PaginatedResponse<ProjectListItem> | null }
    ) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(projectsKeys.lists(), context.previousProjects)
      }
      console.error('Error creating project:', error)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() })
    },
  })
}

/**
 * Update an existing project with optimistic update
 */
export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProjectFormData }) => {
      const { tag_ids, ...projectData } = data
      const result = await updateProject(id, projectData)

      if (tag_ids) {
        await updateProjectTags(id, tag_ids)
      }

      return result
    },
    // Optimistic update
    onMutate: async ({ id, data }: { id: string; data: ProjectFormData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectsKeys.lists() })
      await queryClient.cancelQueries({ queryKey: projectsKeys.detail(id) })

      // Snapshot previous value
      const previousProjects = queryClient.getQueryData<
        PaginatedResponse<ProjectListItem>
      >(projectsKeys.lists())
      const previousProjectDetail = queryClient.getQueryData(
        projectsKeys.detail(id)
      )

      // Optimistically update to the new value
      if (previousProjects) {
        queryClient.setQueryData(projectsKeys.lists(), {
          ...previousProjects,
          data: previousProjects.data.map(project =>
            project.id === id
              ? { ...project, ...data, updated_at: new Date().toISOString() }
              : project
          ),
        })
      }

      if (previousProjectDetail) {
        queryClient.setQueryData(projectsKeys.detail(id), {
          ...previousProjectDetail,
          ...data,
          updated_at: new Date().toISOString(),
        })
      }

      return {
        previousProjects: previousProjects ?? null,
        previousProjectDetail,
      }
    },
    onError: (
      error: Error,
      { id }: { id: string; data: ProjectFormData },
      context?: {
        previousProjects: PaginatedResponse<ProjectListItem> | null
        previousProjectDetail: unknown
      }
    ) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(projectsKeys.lists(), context.previousProjects)
      }
      if (context?.previousProjectDetail) {
        queryClient.setQueryData(
          projectsKeys.detail(id),
          context.previousProjectDetail
        )
      }
      console.error('Error updating project:', error)
    },
    onSettled: (_data, _error, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: projectsKeys.detail(id) })
    },
  })
}

/**
 * Delete a project with optimistic update
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteProject(id)
      return id
    },
    // Optimistic update
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectsKeys.lists() })
      await queryClient.cancelQueries({ queryKey: projectsKeys.detail(id) })

      // Snapshot previous value
      const previousProjects = queryClient.getQueryData<
        PaginatedResponse<ProjectListItem>
      >(projectsKeys.lists())

      // Optimistically remove from the list
      if (previousProjects) {
        queryClient.setQueryData(projectsKeys.lists(), {
          ...previousProjects,
          data: previousProjects.data.filter(project => project.id !== id),
        })
      }

      return { previousProjects: previousProjects ?? null }
    },
    onError: (
      error: Error,
      _id: string,
      context?: { previousProjects: PaginatedResponse<ProjectListItem> | null }
    ) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(projectsKeys.lists(), context.previousProjects)
      }
      console.error('Error deleting project:', error)
    },
    onSettled: (_data, _error, id) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() })
      queryClient.removeQueries({ queryKey: projectsKeys.detail(id) })
    },
  })
}
