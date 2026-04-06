<template>
    <div class="m-horse-map">
        <div v-if="maps.length > 1" class="m-map-tabs">
            <span
                class="u-tab"
                :class="{ 'is-active': String(activeMapId) === String(map.id) }"
                v-for="map in maps"
                :key="map.id"
                @click="activeMapId = map.id"
            >
                {{ map.name }}
            </span>
        </div>
        <div class="m-map-panel" v-if="activeMap">
            <Jx3boxMap
                :mapId="Number(activeMap.id)"
                :datas="activeMap.datas"
                :lockSubId="0"
                @resize="handleResize"
            ></Jx3boxMap>
        </div>
    </div>
</template>

<script>
import Jx3boxMap from "@jx3box/jx3box-map/src/components/Map.vue";

export default {
    name: "QQBotPvxHorseMap",
    components: {
        Jx3boxMap,
    },
    props: {
        name: {
            type: String,
            required: true,
        },
        list: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            activeMapId: "",
        };
    },
    computed: {
        mapDatas() {
            const result = {};
            const horseName = this.name || "";
            const pureName = horseName.indexOf("·") > -1 ? horseName.split("·")[0] : horseName;
            this.list.forEach((data) => {
                const mapId = data?.mapId;
                if (!mapId) return;
                if (!result[mapId]) result[mapId] = [];
                (data.coordinates || []).forEach((coor) => {
                    result[mapId].push({
                        title: data.mapName,
                        content: `马驹·${pureName}<br />坐标：(${coor.x},${coor.y},${coor.z})`,
                        x: coor.x,
                        y: coor.y,
                        z: coor.z,
                    });
                });
            });
            return result;
        },
        maps() {
            return Object.keys(this.mapDatas).map((mapId) => ({
                id: mapId,
                name: this.list.find((item) => String(item.mapId) === String(mapId))?.mapName || `地图${mapId}`,
                datas: this.mapDatas[mapId] || [],
            }));
        },
        activeMap() {
            return this.maps.find((map) => String(map.id) === String(this.activeMapId)) || this.maps[0] || null;
        },
    },
    watch: {
        maps: {
            immediate: true,
            handler(val = []) {
                if (!val.length) {
                    this.activeMapId = "";
                    return;
                }
                if (!val.find((map) => String(map.id) === String(this.activeMapId))) {
                    this.activeMapId = val[0].id;
                }
            },
        },
    },
    methods: {
        handleResize() {},
    },
};
</script>

<style lang="less">
.m-horse-map {
    .m-map-tabs {
        .flex;
        flex-wrap: wrap;
        gap: 6px;
        margin: 8px 10px 6px;

        .u-tab {
            font-size: 10px;
            line-height: 18px;
            padding: 0 6px;
            border-radius: 3px;
            color: rgba(255, 255, 255, 0.75);
            background: rgba(255, 255, 255, 0.12);
            cursor: pointer;
            user-select: none;

            &.is-active {
                color: #fff;
                background: rgba(255, 168, 17, 0.55);
            }
        }
    }

    .m-map-panel {
        width: 100%;
    }

    .c-map .c-map__inner {
        border: none !important;
        box-shadow: none !important;
    }

    .c-map {
        align-items: flex-start;
    }
}
</style>
