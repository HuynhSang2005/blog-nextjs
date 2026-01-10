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
import type { ProjectStatus, PaginationParams } from '@/types/supabase-helpers'
import type { ProjectFilterParams } from '@/services/project-service'

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
 * Create a new project
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() })
    },
    onError: (error: Error) => {
      console.error('Error creating project:', error)
    },
  })
}

/**
 * Update an existing project
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: projectsKeys.detail(variables.id),
      })
    },
    onError: (error: Error) => {
      console.error('Error updating project:', error)
    },
  })
}

/**
 * Delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteProject(id)
      return id
    },
    onSuccess: id => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() })
      queryClient.removeQueries({ queryKey: projectsKeys.detail(id) })
    },
    onError: (error: Error) => {
      console.error('Error deleting project:', error)
    },
  })
}
