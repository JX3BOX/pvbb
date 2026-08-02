<template>
    <section class="m-team-banner" :class="{ 'is-archive': variant === 'archive' }">
        <div v-if="variant === 'archive'" class="m-archive-field-label">{{ $t("team.settingSections.banner") }}</div>
        <el-divider v-else content-position="left"> <i class="el-icon-picture-outline"></i> {{ $t("team.settingSections.banner") }} </el-divider>
        <div class="m-banner-editor">
            <uploadImage
                v-model="banner"
                :size="variant === 'archive' ? [920, 120] : 148"
                :info="$t('team.settingSections.bannerHint')"
            ></uploadImage>
            <div v-if="variant === 'archive'" class="m-banner-editor__actions">
                <p>{{ $t("team.settingSections.bannerHint") }}</p>
                <el-button class="u-submit-btn" type="primary" icon="Upload" @click="submitBanner" :loading="saving"
                    >{{ $t("team.settingSections.saveBanner") }}</el-button
                >
            </div>
        </div>
        <el-button
            v-if="variant !== 'archive'"
            class="u-submit-btn"
            type="primary"
            size="small"
            icon="Upload"
            @click="submitBanner"
            :loading="saving"
            >{{ $t("team.settingSections.submitBanner") }}</el-button
        >
    </section>
</template>

<script>
import uploadImage from "@jx3box/jx3box-ui/src/upload/UploadBanner.vue";
import { updateTeamInfo } from "@/service/team/team.js";
export default {
    name: "team_banner",
    components: {
        uploadImage,
    },
    props: {
        teamInfo: {
            type: Object,
            default: () => {
                return {};
            },
        },
        variant: {
            type: String,
            default: "default",
        },
    },
    data() {
        return {
            banner: this.data,
            saving: false,
        };
    },
    computed: {
        id: function () {
            return ~~this.$route.params.id;
        },
    },
    watch: {
        teamInfo: {
            deep: true,
            immediate: true,
            handler: function (newval) {
                this.banner = newval.banner;
            },
        },
    },
    methods: {
        submitBanner: function () {
            this.saving = true;
            return updateTeamInfo(this.id, {
                banner: this.banner,
            })
                .then(() => {
                    this.$message.success(this.variant === "archive" ? this.$t("team.settingSections.bannerSaved") : this.$t("team.settingSections.bannerUploaded"));
                })
                .finally(() => {
                    this.saving = false;
                });
        },
    },
};
</script>

<style lang="less">
@import (reference) "@/assets/css/team/design-system/_tokens.less";

.m-team-banner {
    .u-submit-btn {
        margin-top: 10px;
    }

    &.is-archive {
        min-width: 0;
        margin-bottom: @team-space-3;

        .m-banner-editor {
            display: flex;
            flex-direction: column;
            align-items: start;
            gap: @team-space-4;
        }

        .c-upload-banner {
            min-width: 0;

            .u-tip {
                display: none;
            }

            .u-upload {
                width: 920px;
                max-width: 100%;
                height: auto !important;
                aspect-ratio: 920 / 120;
                margin-top: 0;
                overflow: hidden;
                border: 1px dashed @team-border;
                border-radius: 12px;
                background: @team-surface-muted;

                img {
                    object-fit: cover;
                    object-position: right center;
                }
            }
        }

        .m-banner-editor__actions {
            display: flex;
            align-items: flex-start;
            flex-direction: column;
            gap: @team-space-3;

            p {
                margin: 0;
                color: @team-text-muted;
                font-size: 12px;
                line-height: 20px;
            }

            .u-submit-btn {
                min-width: 112px;
                min-height: 40px;
                margin: 0;
                border-radius: 10px;
                font-weight: 600;
            }
        }
    }
}

@media screen and (max-width: 700px) {
    .m-team-banner.is-archive {
        .m-banner-editor {
            flex-direction: column;
        }
    }
}

@media screen and (max-width: 520px) {
    .m-team-banner.is-archive {
        .m-banner-editor__actions,
        .u-submit-btn {
            width: 100%;
        }
    }
}
</style>
