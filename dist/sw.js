const cacheStorageKey = "check-demo-2.9"; //版本号，当想更新缓存资源（文件、数据等）
const cacheList = ["./"]; //需要缓存的文件路径

/**
 * install 事件，它发生在浏览器安装并注册 Service Worker 时
 */
self.addEventListener("install", function(e) {
  /* event.waitUtil 用于在安装成功之前执行一些预装逻辑
 但是建议只做一些轻量级和非常重要资源的缓存，减少安装失败的概率
 安装成功后 ServiceWorker 状态会从 installing 变为 installed */
  e.waitUntil(
    //创建缓存并缓存cacheList的所以文件
    caches
      .open(cacheStorageKey)
      .then(function(cache) {
        return cache.addAll(cacheList); // 如果所有的文件都成功缓存了，便会安装完成。如果任何文件下载失败了，那么安装过程也会随之失败。
      })
      .then(function() {
        //使用了一个方法那就是 self.skipWaiting( ) ，为了在页面更新的过程当中，新的 SW 脚本能够立刻激活和生效
        return self.skipWaiting();
      })
  );
});

/**
 为 fetch 事件添加一个事件监听器。接下来，使用 caches.match() 函数来检查传入的请求 URL 是否匹配当前缓存中存在的任何内容。
 如果存在的话，返回缓存的资源。
 如果资源并不存在于缓存当中，通过网络来获取资源，并将获取到的资源添加到缓存中。
 */
self.addEventListener("fetch", function(e) {
  // 可在此处加入请求过滤条件判断
  e.respondWith(
    caches.match(e.request).then(function(response) {
      if (response != null) {
        return response;
      }
      // request和response是一个流，它只能消耗一次。因为已经在 caches.match 中使用过一次，
      // 然后发起 HTTP 请求还要再消耗一次，所以需要在此时克隆请求
      const fetchRequest = e.request.clone();
      return fetch(fetchRequest).then(function(res) {
        // 检查是否成功
        //失败了
        if (!res || res.status !== 200) {
          return res;
        }
        // 如果成功，该 response 一是要拿给浏览器渲染，二是要进行缓存。
        // 不过需要记住，由于 caches.put 使用的是文件的响应流，只能消耗一次，
        // 所以返回的 response 就无法访问造成失败，因此在这里需要复制一份。
        const responseToCache = res.clone();
        caches.open(cacheStorageKey).then(function(cache) {
          cache.put(e.request, responseToCache);
        });
        return res;
      });
    })
  );
});

/**
 * 当被激活时，检查版本资源，移除旧版本的资源
 */
self.addEventListener("activate", function(e) {
  e.waitUntil(
    //获取所有cache名称
    caches
      .keys()
      .then(function(cacheNames) {
        return Promise.all(
          //移除不是该版本的所有资源
          cacheNames
            .filter(function(cacheName) {
              return cacheName !== cacheStorageKey;
            })
            .map(function(cacheName) {
              return caches.delete(cacheName);
            })
        );
      })
      .then(function() {
        return self.clients.claim(); //在新安装的 SW 中通过调用 self.clients.claim( ) 取得页面的控制权，这样之后打开页面都会使用版本更新的缓存。
      })
  );
});
