import * as k8s from '@kubernetes/client-node';
import { Observable } from "rxjs";
import * as winston from "winston";

let instanceID = 0;


export interface KubeWatchEvent<T> {
    phase: string;
    apiObj: T;
    watchObj?: any
}

/**
 * Watches a given kubernetes resource for changes and emits KuberWatchEvents.
 * 
 * @param resource Name of the resouce e.g. /api/v1/watch/namespaces/<myNamespace>/configmaps/<myConfigmap>
 * @param kubeConfig Optional kubeConfig options (not implemented yet)
 * @returns Observable<KubeWatchEvent> emitting events on changes of resource
 */
export function watchKubeResourceRx<T>(resource: string, kubeConfig: any = {}): Observable<KubeWatchEvent<T>> {
    return new Observable<KubeWatchEvent<T>>((observer) => {
        const id = instanceID++;
        const log = winston.child({
            name: `wk-${instanceID}`,
            type: 'watchkubeRx',
        });
        const kc = new k8s.KubeConfig();
        kc.loadFromDefault();

        const watch = new k8s.Watch(kc);
        let watcher = null;
        let unsubscribed = false;

        watch.watch(resource,
            {},
            (phase: string, apiObj: any, watchObj?: any) => {
                observer.next({ phase: phase, apiObj: apiObj, watchObj: watchObj } as any);
            },
            (err: any) => {
                if (unsubscribed) {
                    observer.complete()
                } else {
                    log.warn(`Warning k8-watcher has completed! For [${resource}]`, err);
                    observer.error(err);
                }
            }).then((watcherRef) => {
                log.info(`K8-Watcher connected for [${resource}]`);
                watcher = watcherRef
            });
        return () => {
            unsubscribed = true;
            watcher.abort();
        }
    });

}
