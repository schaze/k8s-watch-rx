# k8s-watch-rx
Simple Observable wrapper for kubernetes-client k8s.watch


### *Note:*

*This is currently a very basic library. There is no support for any special kubernetes configuration. All is loaded from the default config of the current runtime environment.*

## Basic usage example:
```typescript

import { watchKubeResourceRx } from "k8s-watch-rx"; 
import { V1ConfigMap } from "@kubernetes/client-node";

const namespace='default';
const configMapName='some-config-map';

// watch a configmap in default namesapce
const watch = watchKubeResourceRx<V1ConfigMap>(`/api/v1/watch/namespaces/${namespace}/configmaps/${configMapName}`);

watch.subscribe({
    next: event => {
        console.log('Received event: ', event.phase);
        console.log('for configmap: ', JSON.stringify(event.apiObj, undefined, 2));
    }
});



```