import { createApp, ref, computed, onMounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js';

function djb2(str) {
  let hash = 7536;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash;
}

function hashStringToColor(str) {
  const hash = djb2(str);
  const h = Math.abs(hash) % 360;
  const s = 55 + (Math.abs(hash >> 8) % 20);
  const l = 55 + (Math.abs(hash >> 16) % 15);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function shortId(id) {
  return id ? id.substring(0, 12) : '';
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}

async function fetchJson(url) {
  const res = await fetch(url);
  const data = await res.json();
  return data.result || {};
}

const app = createApp({
  setup() {
    const containers = ref({});
    const exitedContainers = ref({});
    const images = ref({});
    const danglingImages = ref({});
    const volumes = ref({});
    const danglingVolumes = ref({});
    const networks = ref({});
    const danglingNetworks = ref({});
    const buildCache = ref({});
    const selectedType = ref(null);
    const selectedId = ref(null);
    const searchQuery = ref('');
    const relatedImage = ref(null);
    const relatedVolumes = ref(new Set());
    const relatedNetworks = ref(new Set());
    const relatedContainers = ref(new Set());
    const loading = ref(false);

    const hasSelection = computed(() => selectedType.value !== null);

    function matchesSearch(text) {
      if (!searchQuery.value) return true;
      return text.toLowerCase().includes(searchQuery.value.toLowerCase());
    }

    function containerLabel(info) {
      return info.Name ? info.Name.replace('/', '') : '';
    }

    function imageLabel(info) {
      return info.RepoTags && info.RepoTags[0] ? info.RepoTags[0] : '';
    }

    const filteredContainers = computed(() => {
      if (!searchQuery.value) return containers.value;
      return Object.fromEntries(Object.entries(containers.value).filter(([id, info]) =>
        matchesSearch(containerLabel(info)) || matchesSearch(id)
      ));
    });

    const filteredExitedContainers = computed(() => {
      if (!searchQuery.value) return exitedContainers.value;
      return Object.fromEntries(Object.entries(exitedContainers.value).filter(([id, info]) =>
        matchesSearch(containerLabel(info)) || matchesSearch(id)
      ));
    });

    const filteredImages = computed(() => {
      if (!searchQuery.value) return images.value;
      return Object.fromEntries(Object.entries(images.value).filter(([id, info]) =>
        matchesSearch(imageLabel(info)) || matchesSearch(id)
      ));
    });

    const filteredDanglingImages = computed(() => {
      if (!searchQuery.value) return danglingImages.value;
      return Object.fromEntries(Object.entries(danglingImages.value).filter(([id]) =>
        matchesSearch(id)
      ));
    });

    const filteredVolumes = computed(() => {
      if (!searchQuery.value) return volumes.value;
      return Object.fromEntries(Object.entries(volumes.value).filter(([name]) =>
        matchesSearch(name)
      ));
    });

    const filteredDanglingVolumes = computed(() => {
      if (!searchQuery.value) return danglingVolumes.value;
      return Object.fromEntries(Object.entries(danglingVolumes.value).filter(([name]) =>
        matchesSearch(name)
      ));
    });

    const filteredNetworks = computed(() => {
      if (!searchQuery.value) return networks.value;
      return Object.fromEntries(Object.entries(networks.value).filter(([id, info]) =>
        matchesSearch(info.Name || '') || matchesSearch(id)
      ));
    });

    const filteredDanglingNetworks = computed(() => {
      if (!searchQuery.value) return danglingNetworks.value;
      return Object.fromEntries(Object.entries(danglingNetworks.value).filter(([id, info]) =>
        matchesSearch(info.Name || '') || matchesSearch(id)
      ));
    });

    const filteredBuildCache = computed(() => {
      if (!searchQuery.value) return buildCache.value;
      return Object.fromEntries(Object.entries(buildCache.value).filter(([id, info]) =>
        matchesSearch(info.Description || '') || matchesSearch(info.Type || '') || matchesSearch(id)
      ));
    });

    const objectCount = computed(() =>
      Object.keys(containers.value).length +
      Object.keys(exitedContainers.value).length +
      Object.keys(images.value).length +
      Object.keys(volumes.value).length +
      Object.keys(networks.value).length
    );

    async function fetchAll() {
      loading.value = true;
      clearSelection();

      try {
        const [c, ce, img, imgD, vol, volD, net, netD, bc] = await Promise.all([
          fetchJson('/containers'),
          fetchJson('/containers/exited'),
          fetchJson('/images'),
          fetchJson('/images/dangling'),
          fetchJson('/volumes'),
          fetchJson('/volumes/dangling'),
          fetchJson('/networks'),
          fetchJson('/networks/dangling'),
          fetchJson('/buildcache'),
        ]);
        containers.value = c;
        exitedContainers.value = ce;
        images.value = img;
        danglingImages.value = imgD;
        volumes.value = vol;
        danglingVolumes.value = volD;
        networks.value = net;
        danglingNetworks.value = netD;
        buildCache.value = bc;
      } catch (e) {
        console.error('Failed to fetch Docker data:', e);
      } finally {
        loading.value = false;
      }
    }

    function clearSelection() {
      selectedType.value = null;
      selectedId.value = null;
      relatedImage.value = null;
      relatedVolumes.value = new Set();
      relatedNetworks.value = new Set();
      relatedContainers.value = new Set();
    }

    function toggleSelection(type, id, setupFn) {
      if (selectedType.value === type && selectedId.value === id) {
        clearSelection();
        return;
      }
      clearSelection();
      selectedType.value = type;
      selectedId.value = id;
      setupFn();
    }

    async function selectContainer(containerId) {
      if (selectedType.value === 'container' && selectedId.value === containerId) {
        clearSelection();
        return;
      }
      clearSelection();
      selectedType.value = 'container';
      selectedId.value = containerId;

      try {
        const [imgRes, volRes, netRes] = await Promise.all([
          fetchJson(`/images/used_by/${containerId}`),
          fetchJson(`/volumes/used_by/${containerId}`),
          fetchJson(`/networks/used_by/${containerId}`),
        ]);

        if (selectedType.value !== 'container' || selectedId.value !== containerId) return;

        if (typeof imgRes === 'string') {
          relatedImage.value = imgRes;
        }

        const volNames = new Set();
        if (typeof volRes === 'object') {
          for (const key in volRes) {
            const v = volRes[key];
            if (v && v.Name) volNames.add(v.Name);
          }
        }
        relatedVolumes.value = volNames;

        const netIds = new Set();
        if (typeof netRes === 'object') {
          for (const key in netRes) {
            const n = netRes[key];
            if (n && n.NetworkID) netIds.add(n.NetworkID);
          }
        }
        relatedNetworks.value = netIds;
      } catch (e) {
        console.error('Failed to fetch related objects:', e);
      }
    }

    function selectNetwork(networkId) {
      toggleSelection('network', networkId, () => {
        const info = networks.value[networkId];
        if (info && info.Containers) {
          relatedContainers.value = new Set(Object.keys(info.Containers));
        }
      });
    }

    function selectImage(imageId) {
      toggleSelection('image', imageId, () => {
        const matched = new Set();
        for (const [cId, cInfo] of Object.entries(containers.value)) {
          if (cInfo.Image === imageId) {
            matched.add(cId);
          }
        }
        relatedContainers.value = matched;
      });
    }

    function selectVolume(volumeName) {
      toggleSelection('volume', volumeName, () => {
        const matched = new Set();
        for (const [cId, cInfo] of Object.entries(containers.value)) {
          if (cInfo.Mounts) {
            for (const mount of cInfo.Mounts) {
              if (mount.Type === 'volume' && mount.Name === volumeName) {
                matched.add(cId);
              }
            }
          }
        }
        relatedContainers.value = matched;
      });
    }

    function isHighlighted(type, id) {
      if (!hasSelection.value) return false;
      if (type === selectedType.value && id === selectedId.value) return true;

      if (selectedType.value === 'container') {
        if (type === 'image') return id === relatedImage.value;
        if (type === 'volume') return relatedVolumes.value.has(id);
        if (type === 'network') return relatedNetworks.value.has(id);
      } else {
        if (type === 'container') return relatedContainers.value.has(id);
      }
      return false;
    }

    function refresh() {
      fetchAll();
    }

    onMounted(() => {
      fetchAll();
    });

    return {
      containers,
      exitedContainers,
      images,
      danglingImages,
      volumes,
      danglingVolumes,
      networks,
      danglingNetworks,
      buildCache,
      searchQuery,
      filteredContainers,
      filteredExitedContainers,
      filteredImages,
      filteredDanglingImages,
      filteredVolumes,
      filteredDanglingVolumes,
      filteredNetworks,
      filteredDanglingNetworks,
      filteredBuildCache,
      selectedType,
      selectedId,
      hasSelection,
      loading,
      objectCount,
      selectContainer,
      selectNetwork,
      selectImage,
      selectVolume,
      isHighlighted,
      hashStringToColor,
      shortId,
      formatBytes,
      refresh,
    };
  },
});

app.mount('#app');
