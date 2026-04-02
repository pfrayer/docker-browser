import { createApp, ref, reactive, onMounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js';

function djb2(str) {
  let hash = 7536;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash;
}

function hashStringToColor(str) {
  const hash = djb2(str);
  const r = (hash & 0xFF0000) >> 16;
  const g = (hash & 0x00FF00) >> 8;
  const b = hash & 0x0000FF;
  return "#" + ("0" + r.toString(16)).substr(-2) + ("0" + g.toString(16)).substr(-2) + ("0" + b.toString(16)).substr(-2);
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
    const relatedImage = ref(null);
    const relatedVolumes = ref(new Set());
    const relatedNetworks = ref(new Set());
    const loading = ref(false);

    async function fetchAll() {
      loading.value = true;
      selectedContainer.value = null;
      relatedImage.value = null;
      relatedVolumes.value = new Set();
      relatedNetworks.value = new Set();

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

    async function selectContainer(containerId) {
      selectedContainer.value = containerId;
      relatedImage.value = null;
      relatedVolumes.value = new Set();
      relatedNetworks.value = new Set();

      try {
        const [imgRes, volRes, netRes] = await Promise.all([
          fetchJson(`/images/used_by/${containerId}`),
          fetchJson(`/volumes/used_by/${containerId}`),
          fetchJson(`/networks/used_by/${containerId}`),
        ]);

        // Image result is a plain string
        if (typeof imgRes === 'string') {
          relatedImage.value = imgRes;
        }

        // Volumes result is a map; collect volume names
        const volNames = new Set();
        if (typeof volRes === 'object') {
          for (const key in volRes) {
            const v = volRes[key];
            if (v && v.Name) volNames.add(v.Name);
          }
        }
        relatedVolumes.value = volNames;

        // Networks result is a map; collect network IDs
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

    function isHighlighted(type, id) {
      if (!selectedContainer.value) return false;
      if (type === 'container') return id === selectedContainer.value;
      if (type === 'image') return id === relatedImage.value;
      if (type === 'volume') return relatedVolumes.value.has(id);
      if (type === 'network') return relatedNetworks.value.has(id);
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
      loading,
      selectContainer,
      isHighlighted,
      hashStringToColor,
      shortId,
      refresh,
    };
  },
});

app.mount('#app');
