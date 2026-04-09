<template>
    <div class="m-qqbot-pvx-pet" v-loading="loading">
        <div v-if="pet && Object.keys(pet).length">
            <div class="m-pvx__item m-robot__pet-header">
                <div class="m-title">
                    <div class="u-title" :class="`u-title__level-${pet.Quality}`">
                        {{ robotTitle }}
                        <i class="u-stars">
                            <i class="el-icon-star-on" v-for="count in pet.Star || 0" :key="count"></i>
                        </i>
                    </div>
                    <div class="m-meta">
                        <div class="u-meta u-score" :class="`u-score-${getScoreClass(pet.Score)}`">
                            {{ pet.Score || 0 }}分
                        </div>
                        <div class="u-meta u-class" :class="`u-class-${pet.Class}`">{{ getPetType(pet.Class) }}</div>
                        <div class="u-meta">ID: {{ id }}</div>
                    </div>
                </div>
                <div class="u-right">
                    <img class="u-icon" src="@/assets/img/qqbot/jx3box_qqbot_pet.svg" alt="" />
                </div>
            </div>

            <div class="m-robot__pet-info">
                <div class="u-logo">
                    <img :src="getImgSrc(pet.BgPath)" class="u-image" alt="" @error="replaceByDefault" />
                </div>
                <div class="m-pvx__item u-info">
                    <div class="u-info__top">
                        <div class="u-meta u-get-way">
                            <span class="u-meta-label">获取方式：</span>{{ getPetSource(pet.Source) }}
                        </div>
                        <div class="u-meta u-source">
                            <span class="u-meta-label">获取线索：</span>
                            <template v-for="item in getPetDesc(pet.OutputDes)" :key="item.text">
                                <span>{{ cleanResourceText(item.text) }}</span>
                            </template>
                        </div>
                    </div>
                    <div class="u-info__bottom">
                        <template v-for="(item, index) in getPetDesc(pet.Desc)" :key="index">
                            <span v-html="item.text"></span>
                        </template>
                    </div>
                </div>
            </div>

            <div class="m-pvx__item m-robot__pet-skill">
                <div class="u-title">交互技能</div>
                <div class="m-skills" v-if="petSkills.length">
                    <div class="u-skill" v-for="(skill, index) in petSkills" :key="skill.SkillID || skill.ID || index">
                        <img class="u-skill-icon" :src="iconLink(skill.IconID)" :alt="skill.Name" />
                        <div class="u-skill-info">
                            <div class="u-skill-name">{{ skill.Name || "-" }}</div>
                            <div class="u-skill-desc">{{ skill.Desc || "-" }}</div>
                        </div>
                    </div>
                </div>
                <div class="m-empty" v-else>暂无交互技能</div>
            </div>

            <template v-if="medalList.length">
                <div class="m-pvx__item m-robot-pet__fetters" v-for="item in medalList" :key="item.ID">
                    <div class="u-title">羁绊 · {{ item.Name }}</div>
                    <div class="u-desc">{{ showPetterDesc(item.Des) }}</div>
                    <span v-for="fetterPet in item.petList || []" :key="fetterPet.Index" class="u-fetter">
                        <i class="u-fetter-icon" :class="['u-quality-' + fetterPet.Quality]">
                            <img :src="iconLink(fetterPet.IconID)" alt="" />
                        </i>
                        <span class="u-fetter-name" :class="{ 'is-active': String(fetterPet.Index) === String(id) }">
                            {{ fetterPet.Name }}
                        </span>
                    </span>
                </div>
            </template>

            <div class="m-pet-strategy">
                <div class="m-title">
                    <div class="u-title">宠物攻略</div>
                    <span>（以魔盒在线版本为准）</span>
                </div>
                <div class="w-pvx-user">
                    <div class="m-wiki-post-panel is-robot" v-if="wikiPost && wikiPost.post">
                        <WikiPanel :wiki-post="wikiPost" :showQR="false">
                            <template #body>
                                <Article id="pvxPetWiki" :content="wikiPost.post.content" />
                                <div class="m-wiki-signature">
                                    <i class="el-icon-edit"></i>
                                    本次修订由 <b>{{ wikiPost.post.user_nickname || "-" }}</b> 提交于{{ wikiUpdatedAt }}
                                </div>
                            </template>
                        </WikiPanel>
                    </div>
                    <div class="m-wiki-post-empty is-robot-empty" v-else>暂无相关攻略，欢迎热心侠士前往补充！</div>
                </div>
            </div>
        </div>
        <div v-else class="m-wiki-post-empty is-robot-empty">未找到对应宠物数据</div>
    </div>
</template>

<script>
import petType from "@/assets/data/qqbot/pvx/pet_type.json";
import petSource from "@/assets/data/qqbot/pvx/pet_source.json";
import { __imgPath } from "@/utils/config";
import { iconLink, extractTextContent, ts2str } from "@jx3box/jx3box-common/js/utils";
import { wiki } from "@jx3box/jx3box-common/js/wiki";
import Article from "@jx3box/jx3box-editor/src/Article.vue";
import WikiPanel from "@jx3box/jx3box-ui/src/wiki/WikiPanel";
import { getPet, getPetsByIds, getSkillsByIds } from "@/service/qqbot-pvx";

export default {
    name: "QQBotPvxPetSingle",
    components: {
        WikiPanel,
        Article,
    },
    props: {
        sourceId: {
            type: [String, Number],
            default: "",
        },
    },
    data() {
        return {
            loading: false,
            pet: null,
            petSkills: [],
            medalList: [],
            wikiPost: null,
        };
    },
    computed: {
        id() {
            return this.sourceId || this.$route.query.id || "";
        },
        itemId() {
            const itemType = this.pet?.ItemTabType;
            const itemIndex = this.pet?.ItemTabIndex;
            if (itemType === undefined || itemType === null || itemIndex === undefined || itemIndex === null) return "";
            return `${itemType}_${itemIndex}`;
        },
        client() {
            return this.$store.state.client;
        },
        robotTitle() {
            return `宠物 · ${this.pet?.Name || ""}`;
        },
        wikiUpdatedAt() {
            const updated = this.wikiPost?.post?.updated;
            if (!updated) return "-";
            return String(ts2str(updated)).split(" ")[0];
        },
    },
    watch: {
        id: {
            immediate: true,
            handler(id) {
                if (!id) return;
                this.fetchPet(id);
            },
        },
    },
    methods: {
        iconLink,
        setNotReady() {
            window.__READY__ = false;
        },
        setReady() {
            window.__READY__ = true;
        },
        showPetterDesc(str) {
            const result = extractTextContent(str || "");
            return result?.[0]?.text || "";
        },
        getImgSrc(path) {
            if (!path) return "";
            const imgName = path.match(/.*[\/,\\](.*?).tga/);
            return imgName ? `${__imgPath}pet/pets/${this.client}/${imgName[1]}.png` : "";
        },
        replaceByDefault(e) {
            e.target.src = `${__imgPath}pet/pets/${this.client}/3d_bg.png`;
        },
        getScoreClass(score) {
            const n = Number(score || 0);
            if (n >= 60) return 5;
            if (n >= 50) return 4;
            if (n >= 40) return 3;
            if (n >= 30) return 2;
            return 1;
        },
        getPetType(typeId) {
            const item = petType.find((v) => v.class === typeId);
            return item?.name || "";
        },
        getPetSource(sourceId) {
            const item = petSource.find((v) => Number(v.source) === Number(sourceId));
            return item?.name || "";
        },
        getPetDesc(str = "") {
            const regex = /<text>text=(.*?)font=(\d+).*?<\/text>/gimsy;
            const matches = [];
            let match;
            while ((match = regex.exec(str))) matches.push(match);
            return matches.map((group) => ({
                font: Number(group[2]),
                text: group[1].slice(1, -2).replace(/[\\n]/g, ""),
            }));
        },
        cleanResourceText(str) {
            return str && str.startsWith("获取线索：") ? str.replace("获取线索：", "") : str;
        },
        async loadPetMedal() {
            const ids = new Set();
            this.medalList.forEach((item) => {
                item.pets = [];
                Object.keys(item).forEach((key) => {
                    if (key.includes("PetIndex") && item[key]) {
                        item.pets.push(item[key]);
                        ids.add(item[key]);
                    }
                });
            });
            if (!ids.size) return;
            const res = await getPetsByIds([...ids].join(","), this.client);
            const petList = res?.data?.list || [];
            this.medalList = this.medalList.map((item) => ({
                ...item,
                petList: petList.filter((pet) => item.pets.includes(pet.Index)),
            }));
        },
        async loadPetSkills(data) {
            this.petSkills = [];
            if (!data || typeof data !== "object") return;

            const levelIds = [];
            const skillIds = [];
            Object.keys(data).forEach((key) => {
                if (key.startsWith("Level") && data[key]) levelIds.push(data[key]);
                if (key.startsWith("SkillID") && data[key]) skillIds.push(data[key]);
            });

            if (!skillIds.length) return;

            const res = await getSkillsByIds(skillIds.join(","), this.client);
            const skillList = Array.isArray(res?.data) ? res.data : [];
            this.petSkills = levelIds
                .map((level, index) =>
                    skillList.find(
                        (skill) =>
                            String(skill.SkillID) === String(skillIds[index]) && String(skill.Level) === String(level)
                    )
                )
                .filter(Boolean);
        },
        async loadStrategy() {
            this.wikiPost = null;
            if (!this.itemId) return;
            try {
                const res = await wiki.mix({
                    type: "item",
                    id: this.itemId,
                    client: this.client,
                });
                this.wikiPost = {
                    post: res?.post || null,
                    source: res?.source || {},
                    users: res?.users || [],
                };
            } catch (e) {
                this.wikiPost = null;
            }
        },
        async fetchPet(id) {
            this.setNotReady();
            this.loading = true;
            try {
                const res = await getPet(id, this.client);
                this.pet = res?.data || {};
                this.medalList = this.pet?.medal_list || [];
                await Promise.all([
                    this.loadPetMedal(),
                    this.loadPetSkills(this.pet?.__skills),
                    this.loadStrategy(),
                ]);
            } catch (e) {
                this.pet = null;
                this.petSkills = [];
                this.medalList = [];
                this.wikiPost = null;
                this.$message?.error?.("加载宠物详情失败");
            } finally {
                this.loading = false;
                this.setReady();
            }
        },
    },
};
</script>

<style lang="less">
.m-qqbot-pvx-pet {
    .m-robot__pet-header {
        .flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        height: 75px;

        .u-stars {
            color: rgba(255, 195, 0, 1);
            font-size: 14px;
        }

        .u-title {
            font-size: 20px;
            .bold;
            color: #fff;
            .flex;
            align-items: center;
            gap: 5px;

            &.u-title__level-2 {
                color: rgba(13, 192, 63, 1);
            }
            &.u-title__level-3 {
                color: rgba(0, 133, 255, 1);
            }
            &.u-title__level-4 {
                color: rgba(204, 70, 237, 1);
            }
            &.u-title__level-5 {
                color: rgba(255, 168, 17, 1);
            }
        }

        .m-meta {
            margin-top: 4px;
            .flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 4px;

            .u-meta {
                .r(4px);
                background: rgba(89, 89, 89, 1);
                padding: 0 4px;
                font-size: 10px;
                color: #fff;
                height: 15px;
                line-height: 15px;
                box-sizing: border-box;

                &.u-class-1,
                &.u-score-3 {
                    background: rgba(55, 78, 105, 1);
                    color: rgba(94, 199, 255, 1);
                }
                &.u-class-2,
                &.u-score-2 {
                    background: rgba(72, 94, 79, 1);
                    color: rgba(79, 255, 138, 1);
                }
                &.u-class-3 {
                    background: rgba(77, 39, 39, 1);
                    color: rgba(255, 115, 115, 1);
                }
                &.u-score-4 {
                    background: rgba(62, 52, 87, 1);
                    color: rgba(185, 156, 255, 1);
                }
                &.u-class-4,
                &.u-score-5 {
                    background: rgba(102, 85, 53, 1);
                    color: rgba(255, 195, 0, 1);
                }
            }
        }
    }

    .m-robot__pet-info {
        margin-top: 10px;
        .flex;
        gap: 10px;
        justify-content: space-between;
        align-items: stretch;
        min-height: 100px;

        .u-logo {
            width: 100px;
            .r(4px);
            overflow: hidden;

            .u-image {
                .size(100px, 100px);
                object-fit: cover;
                .db;
            }
        }

        .u-info {
            flex: 1;
        }

        .u-info__top {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            color: #fff;
        }

        .u-info__bottom {
            margin-top: 4px;
        }
    }

    .m-robot__pet-skill {
        margin-top: 10px;

        .u-title {
            color: rgba(92, 236, 255, 1);
            font-size: 12px;
            margin-bottom: 8px;
        }

        .m-skills {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 4px;
            width: 100%;
        }

        .u-skill {
            .flex;
            align-items: center;
            gap: 4px;
            width: 33.33%;
            min-width: 180px;
        }

        .u-skill-info {
            width: calc(100% - 28px);
        }

        .u-skill-icon {
            .size(24px);
            .r(2px);
            .db;
        }

        .u-skill-name {
            color: #fff;
            line-height: 1.3;
        }

        .u-skill-desc {
            color: rgba(255, 255, 255, 0.5);
            width: 100%;
            .nobreak;
            line-height: 1.3;
        }

        .m-empty {
            color: rgba(255, 255, 255, 0.6);
            font-size: 12px;
        }
    }

    .m-robot-pet__fetters {
        margin-top: 10px;

        .u-title {
            color: rgba(255, 195, 0, 1);
            font-size: 12px;
        }

        .u-desc {
            margin: 4px 0;
        }

        .u-fetter {
            display: inline-flex;
            flex-direction: column;
            margin-right: 4px;
        }

        .u-fetter-icon {
            .size(36px);
            border: 1px solid transparent;
            box-sizing: border-box;
            .r(4px);
            overflow: hidden;

            &.u-quality-2 {
                border-color: rgba(13, 192, 63, 1);
            }
            &.u-quality-3 {
                border-color: rgba(0, 133, 255, 1);
            }
            &.u-quality-4 {
                border-color: rgba(204, 70, 237, 1);
            }
            &.u-quality-5 {
                border-color: rgba(255, 168, 17, 1);
            }
        }

        .u-fetter-name {
            text-align: center;
            &.is-active {
                color: #fff;
                .bold;
            }
        }
    }

    .m-pet-strategy {
        margin-top: 10px;

        .m-title {
            .flex;
            align-items: center;
            gap: 4px;
            color: rgba(#fff, 0.6);
            margin-bottom: 10px;

            > span {
                font-size: 12px;
                color: rgba(#fff, 0.55);
                line-height: 1;
            }
        }

        .u-title {
            color: #fff;
            .bold;
            font-size: 16px;
        }

        .w-pvx-user {
            .m-wiki-post-panel.is-robot {
                .m-panel-head {
                    .none;
                }

                .c-wiki-panel {
                    margin: 0 !important;
                    border-radius: 8px;
                    overflow: hidden;
                }
            }
        }

        .m-wiki-signature {
            text-align: right;
            color: #999;
            font-size: 12px;
            line-height: 2;
            border-top: 1px dashed #ddd;
            margin-top: 8px;
            padding-top: 5px;
        }

        .m-wiki-post-empty.is-robot-empty {
            width: 100%;
            min-height: 50px;
            .flex;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
    }
}
</style>
