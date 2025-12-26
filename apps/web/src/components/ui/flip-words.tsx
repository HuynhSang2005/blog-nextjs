'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { cn } from '@/lib/utils'

export const FlipWords = ({
  words,
  duration = 3000,
  className,
}: {
  words: string[]
  duration?: number
  className?: string
}) => {
  const [currentWord, setCurrentWord] = useState(words[0])
  const [isAnimating, setIsAnimating] = useState<boolean>(false)

  // thanks for the fix Julian - https://github.com/Julian-AT
  const startAnimation = useCallback(() => {
    if (!currentWord) return
    const word = words[words.indexOf(currentWord) + 1] || words[0]
    setCurrentWord(word)
    setIsAnimating(true)
  }, [currentWord, words])

  useEffect(() => {
    if (!isAnimating)
      setTimeout(() => {
        startAnimation()
      }, duration)
  }, [isAnimating, duration, startAnimation])

  return (
    <AnimatePresence
      onExitComplete={() => {
        setIsAnimating(false)
      }}
    >
      <motion.div
        animate={{
          opacity: 1,
          y: 0,
        }}
        className={cn(
          'z-10 inline-block relative text-left text-neutral-900 dark:text-neutral-100 px-2',
          className
        )}
        exit={{
          opacity: 0,
          y: -40,
          x: 40,
          filter: 'blur(8px)',
          scale: 2,
          position: 'absolute',
        }}
        initial={{
          opacity: 0,
          y: 10,
        }}
        key={currentWord}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 10,
        }}
      >
        {currentWord?.split('').map((letter, index) => (
          <motion.span
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            className="inline-block"
            initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
            // biome-ignore lint/suspicious/noArrayIndexKey: Index is stable for character animation
            key={`${currentWord}-letter-${letter}-${index}`}
            transition={{
              delay: index * 0.08,
              duration: 0.4,
            }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
