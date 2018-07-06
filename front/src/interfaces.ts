import { Stream } from 'xstream';
import { DOMSource, VNode } from '@cycle/dom';
import { StorageSource, StorageRequest, ResponseCollection } from '@cycle/storage';
import { HTTPSource, RequestOptions } from '@cycle/http';
import { TimeSource } from '@cycle/time';
import { RouterSource, HistoryAction } from 'cyclic-router';

export type Component = (s: BaseSources) => BaseSinks;

export interface BaseSources {
  DOM: DOMSource
  HTTP: HTTPSource
  time: TimeSource
  router: RouterSource
  storage: ResponseCollection //StorageSource
}

export interface BaseSinks {
  DOM?: Stream<VNode>
  SEO?: Stream<string[]>
  HTTP?: Stream<RequestOptions>
  router?: Stream<HistoryAction>
  storage?: Stream<StorageRequest>
  speech?: Stream<string>
}
