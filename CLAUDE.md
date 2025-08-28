# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm run build` - Build the library using tsdown
- `pnpm run dev` - Build with watch mode for development
- `pnpm run test` - Run tests with vitest
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run typecheck` - Run TypeScript type checking without emitting files
- `pnpm run lint` - Run ESLint with caching
- `pnpm run lint:fix` - Run ESLint with auto-fix
- `pnpm run format` - Format code with Prettier

## Architecture

This is a TypeScript library for memoizing pure functions with two core components:

### Core Files

- `src/index.ts` - Main memoization logic with `memoizePureFunction()`, `clearCache()`, and `clearGlobalCache()`
- `src/any-key-weak-map.ts` - Custom WeakMap implementation that handles both objects/functions (via WeakMap) and primitives (via Map)

### Memoization Strategy

- Uses a tree-like cache structure where each argument level creates cache nodes
- Cache nodes track status (UNCACHED/CACHED) and results
- Leverages `AnyKeyWeakMap` for automatic memory management through weak references
- Arguments are compared by reference equality (not deep equality)

### Key Implementation Details

- Global cache maps functions to their root cache nodes
- Each argument traverses down the cache tree to find/create the appropriate cache node
- Functions are memoized per-instance, not globally across different function instances
- Supports any number of arguments of any type including primitives, objects, arrays

## Testing

- Uses Vitest as the test runner
- Tests cover edge cases: null/undefined args, error throwing, type preservation, object reference equality
- Test files are in `tests/` directory

## Build System

- Uses `tsdown` for building (outputs to `dist/`)
- TypeScript with strict mode and isolated declarations
- ESLint with @sxzz/eslint-config
- Prettier with tabs for formatting
- Node.js >= 20.19.0 required
