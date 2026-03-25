
import type {
  RouteRecordInfo,
  ParamValue,
  ParamValueOneOrMore,
  ParamValueZeroOrMore,
  ParamValueZeroOrOne,
} from 'vue-router'

declare module 'vue-router' {
  interface TypesConfig {
    ParamParsers: never
  }
}

declare module 'vue-router/auto-routes' {
  
  export interface RouteNamedMap {
    '/': RouteRecordInfo<
      '/',
      '/',
      Record<never, never>,
      Record<never, never>,
      | never
    >,
  }
  
  export interface _RouteFileInfoMap {
    'src/pages/index.vue': {
      routes:
        | '/'
      views:
        | never
    }
  }

  
  export type _RouteNamesForFilePath<FilePath extends string> =
    _RouteFileInfoMap extends Record<FilePath, infer Info>
      ? Info['routes']
      : keyof RouteNamedMap
}

export {}
