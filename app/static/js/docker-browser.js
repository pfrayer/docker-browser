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
    const selectedContainer = ref(null);
    const selectedNetwork = ref(null);
    const relatedImage = ref(null);
    const relatedVolumes = ref(new Set());
    const relatedNetworks = ref(new Set());
    const relatedContainers = ref(new Set());
    const loading = ref(false);

    const hasSelection = computed(() => selectedContainer.value || selectedNetwork.value);

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
        const [c, ce, img, imgD, vol, volD, net, netD] = await Promise.all([
          fetchJson('/containers'),
          fetchJson('/containers/exited'),
          fetchJson('/images'),
          fetchJson('/images/dangling'),
          fetchJson('/volumes'),
          fetchJson('/volumes/dangling'),
          fetchJson('/networks'),
          fetchJson('/networks/dangling'),
        ]);
        containers.value = c;
        exitedContainers.value = ce;
        images.value = img;
        danglingImages.value = imgD;
        volumes.value = vol;
        danglingVolumes.value = volD;
        networks.value = net;
        danglingNetworks.value = netD;
      } catch (e) {
        console.error('Failed to fetch Docker data:', e);
      } finally {
        loading.value = false;
      }
    }

    function clearSelection() {
      selectedContainer.value = null;
      selectedNetwork.value = null;
      relatedImage.value = null;
      relatedVolumes.value = new Set();
      relatedNetworks.value = new Set();
      relatedContainers.value = new Set();
    }

    async function selectContainer(containerId) {
      if (selectedContainer.value === containerId) {
        clearSelection();
        return;
      }

      clearSelection();
      selectedContainer.value = containerId;

      try {
        const [imgRes, volRes, netRes] = await Promise.all([
          fetchJson(`/images/used_by/${containerId}`),
          fetchJson(`/volumes/used_by/${containerId}`),
          fetchJson(`/networks/used_by/${containerId}`),
        ]);

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
      if (selectedNetwork.value === networkId) {
        clearSelection();
        return;
      }

      clearSelection();
      selectedNetwork.value = networkId;

      const networkInfo = networks.value[networkId];
      if (networkInfo && networkInfo.Containers) {
        relatedContainers.value = new Set(Object.keys(networkInfo.Containers));
      }
    }

    function isHighlighted(type, id) {
      if (selectedContainer.value) {
        if (type === 'container') return id === selectedContainer.value;
        if (type === 'image') return id === relatedImage.value;
        if (type === 'volume') return relatedVolumes.value.has(id);
        if (type === 'network') return relatedNetworks.value.has(id);
      }
      if (selectedNetwork.value) {
        if (type === 'network') return id === selectedNetwork.value;
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
      selectedContainer,
      selectedNetwork,
      hasSelection,
      loading,
      objectCount,
      selectContainer,
      selectNetwork,
      isHighlighted,
      hashStringToColor,
      shortId,
      refresh,
    };
  },
});

app.mount('#app');
