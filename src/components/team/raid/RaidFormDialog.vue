<template>
    <el-dialog
        v-model="visible"
        class="m-raid-form-dialog"
        :title="isEdit ? $t('team.raid.common.edit') : $t('team.raid.common.create')"
        width="920px"
        align-center
        append-to-body
        destroy-on-close
        :close-on-click-modal="false"
        @closed="reset"
    >
        <div class="m-raid-dialog-body" v-loading="loading">
            <el-form
                v-if="!loading"
                ref="formRef"
                :model="form"
                :rules="localizedRules"
                label-position="top"
                class="m-raid-dialog-form"
            >
                <section class="m-raid-form-section">
                    <header>
                        <h4>{{ $t("team.raid.form.basic") }}</h4>
                    </header>
                    <div class="m-raid-form-grid">
                        <el-form-item :label="$t('team.raid.form.team')" prop="team_id">
                            <el-select
                                v-model.number="form.team_id"
                                :disabled="isEdit"
                                filterable
                                :placeholder="$t('team.raid.form.selectTeam')"
                                @change="handleTeamChange"
                            >
                                <el-option v-for="item in teams" :key="item.ID" :label="item.name" :value="item.ID" />
                            </el-select>
                        </el-form-item>

                        <el-form-item :label="$t('team.raid.form.name')" prop="name">
                            <div v-if="!isEdit" class="m-raid-event-field">
                                <el-input
                                    v-if="isCustomEvent"
                                    v-model.trim="form.name"
                                    maxlength="20"
                                    :placeholder="$t('team.raid.form.inputName')"
                                    clearable
                                />
                                <el-select
                                    v-else
                                    v-model="preset"
                                    value-key="map_id"
                                    filterable
                                    :placeholder="$t('team.raid.form.selectActivity')"
                                    @change="handlePresetChange"
                                >
                                    <el-option
                                        v-for="item in presets"
                                        :key="item.map_id || item.name"
                                        :label="item.name"
                                        :value="item"
                                    />
                                </el-select>
                                <el-button link type="primary" @click="toggleCustomEvent">
                                    {{ $t(isCustomEvent ? "team.raid.form.preset" : "team.raid.form.custom") }}
                                </el-button>
                            </div>
                            <el-input v-else v-model="form.name" disabled />
                        </el-form-item>

                        <el-form-item v-if="!isEdit && isCustomEvent" :label="$t('team.raid.form.size')" class="is-wide">
                            <div class="m-raid-size-row">
                                <el-select v-model="sample" value-key="label" @change="handleSizeChange">
                                    <el-option
                                        v-for="(item, key) in samples"
                                        :key="key"
                                        :label="showSampleLabel(item)"
                                        :value="item"
                                    />
                                </el-select>
                                <template v-if="isCustomSize">
                                    <el-input-number v-model="form.row" :min="1" :max="5" controls-position="right" />
                                    <span class="u-size-times">×</span>
                                    <el-input-number v-model="form.col" :min="1" :max="5" controls-position="right" />
                                </template>
                                <span class="u-capacity">{{ $t("team.raid.form.capacity", { count: capacity }) }}</span>
                            </div>
                        </el-form-item>

                        <el-form-item :label="$t('team.raid.form.title')" prop="title" class="is-wide">
                            <el-input
                                v-model.trim="form.title"
                                maxlength="50"
                                show-word-limit
                                :placeholder="$t('team.raid.form.titleHint')"
                            />
                        </el-form-item>

                        <el-form-item :label="$t('team.raid.form.time')" prop="start_time">
                            <el-date-picker
                                v-model="form.start_time"
                                type="datetime"
                                :placeholder="$t('team.raid.form.selectTime')"
                                format="YYYY-MM-DD HH:mm"
                                value-format="YYYY-MM-DD HH:mm:ss"
                            />
                        </el-form-item>

                        <el-form-item :label="$t('team.raid.form.leader')" prop="leader">
                            <template #label>
                                <span>{{ $t("team.raid.form.leader") }}</span>
                                <el-tooltip :content="$t('team.raid.form.leaderHint')" placement="top">
                                    <i class="el-icon-info u-label-help"></i>
                                </el-tooltip>
                            </template>
                            <el-input
                                v-model.trim="form.leader"
                                maxlength="12"
                                show-word-limit
                                :placeholder="$t('team.raid.form.leaderPlaceholder')"
                            />
                        </el-form-item>
                    </div>
                </section>

                <section class="m-raid-form-section">
                    <header>
                        <h4>{{ $t("team.raid.form.signup") }}</h4>
                    </header>
                    <el-form-item :label="$t('team.raid.form.condition')" prop="auth" class="u-auth-options">
                        <el-radio-group v-model.number="form.auth">
                            <el-radio-button :value="0">{{ $t("team.raid.form.everyone") }}</el-radio-button>
                            <el-radio-button :value="1">{{ $t("team.raid.form.verifiedRole") }}</el-radio-button>
                            <el-radio-button :value="2">{{ $t("team.raid.form.membersOnly") }}</el-radio-button>
                            <el-radio-button :value="3">{{ $t("team.raid.form.adminOnly") }}</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <div class="m-raid-switch-list">
                        <label>
                            <span>
                                <b>{{ $t("team.raid.form.public") }}</b>
                                <small>{{ $t(isVerified ? "team.raid.form.publicOn" : "team.raid.form.broadcastVerifiedOnly") }}</small>
                            </span>
                            <el-switch v-model="form.is_public" :disabled="!isVerified" :active-value="1" :inactive-value="0" />
                        </label>
                        <label>
                            <span>
                                <b>{{ $t("team.raid.form.autoApprove") }}</b>
                                <small>{{ $t(isVerified ? "team.raid.form.autoApproveOn" : "team.raid.form.verifiedOnly") }}</small>
                            </span>
                            <el-switch v-model="form.auto_accept" :disabled="!isVerified" :active-value="1" :inactive-value="0" />
                        </label>
                        <label>
                            <span>
                                <b>{{ $t("team.raid.form.matchMount") }}</b>
                                <small>{{ $t("team.raid.form.matchMountHint") }}</small>
                            </span>
                            <el-switch v-model="form.force_match" :disabled="!!form.auto_accept" :active-value="1" :inactive-value="0" />
                        </label>
                    </div>
                </section>

                <section class="m-raid-form-section">
                    <header>
                        <h4>{{ $t("team.raid.form.notes") }}</h4>
                    </header>
                    <el-form-item prop="desc" class="u-desc-field">
                        <el-input
                            v-model="form.desc"
                            type="textarea"
                            :rows="3"
                            maxlength="300"
                            show-word-limit
                            :placeholder="$t('team.raid.form.notesPlaceholder')"
                        />
                    </el-form-item>
                </section>
            </el-form>
        </div>

        <template #footer>
            <div class="m-raid-dialog-footer">
                <el-button @click="visible = false">{{ $t("team.raid.common.cancel") }}</el-button>
                <el-button type="primary" :loading="processing" :disabled="loading" @click="submit">
                    {{ $t(isEdit ? "team.raid.common.save" : "team.raid.common.create") }}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import { addRaid, getRaid, getRaidPresets, updateRaid } from "@/service/team/raid.js";
import samples from "@/assets/data/team/team_templates.json";
import serverMap from "@jx3box/jx3box-data/data/server/server_map.json";
import { moment } from "@jx3box/jx3box-common/js/moment";
import pick from "lodash/pick";

const createDefaultForm = () => ({
    team_id: "",
    server: "",
    client: "",
    team_name: "",
    name: "",
    title: "",
    desc: "",
    auth: 0,
    start_time: "",
    leader: "",
    is_public: 0,
    auto_accept: 0,
    force_match: 0,
    row: 5,
    col: 5,
    count: 25,
});

export default {
    name: "RaidFormDialog",
    props: {
        modelValue: { type: Boolean, default: false },
        raidId: { type: [Number, String], default: "" },
        teams: { type: Array, default: () => [] },
        defaultTeamId: { type: [Number, String], default: "" },
    },
    emits: ["update:modelValue", "saved"],
    data() {
        return {
            form: createDefaultForm(),
            presets: [],
            preset: "",
            isCustomEvent: false,
            sample: samples[0],
            samples,
            team: null,
            loading: false,
            processing: false,
            openRequestId: 0,
            presetRequestId: 0,
        };
    },
    computed: {
        visible: {
            get() {
                return this.modelValue;
            },
            set(value) {
                this.$emit("update:modelValue", value);
            },
        },
        isEdit() {
            return !!this.raidId;
        },
        isVerified() {
            return !!this.team?.status;
        },
        isCustomSize() {
            return this.sample?.key === "custom";
        },
        capacity() {
            return Number(this.form.row || 0) * Number(this.form.col || 0);
        },
        currentClient() {
            return serverMap[this.form.server]?.client || this.$store.state.client;
        },
        localizedRules() {
            return {
                team_id: [{ required: true, message: this.$t("team.raid.form.teamRequired"), trigger: "change" }],
                name: [{ required: true, message: this.$t("team.raid.form.nameRequired"), trigger: "change" }],
                start_time: [{ required: true, message: this.$t("team.raid.form.timeRequired"), trigger: "change" }],
            };
        },
    },
    watch: {
        modelValue(value) {
            if (value) this.open();
        },
        "form.auto_accept"(value) {
            if (value) this.form.force_match = 0;
        },
    },
    methods: {
        showSampleLabel(item) {
            return item?.key === "custom" ? this.$t("team.raid.form.custom") : `${item.row}×${item.col}`;
        },
        async open() {
            this.reset();
            const requestId = ++this.openRequestId;
            const raidId = this.raidId;
            this.loading = true;
            try {
                if (this.isEdit) {
                    const res = await getRaid(raidId);
                    if (requestId !== this.openRequestId || String(raidId) !== String(this.raidId) || !this.modelValue) {
                        return;
                    }
                    const raid = res?.data?.data || {};
                    this.form = {
                        ...createDefaultForm(),
                        ...raid,
                        start_time: raid.start_time ? moment(raid.start_time).format("YYYY-MM-DD HH:mm:ss") : "",
                    };
                    this.team = this.teams.find((item) => String(item.ID) === String(this.form.team_id)) || null;
                } else {
                    const team =
                        this.teams.find((item) => String(item.ID) === String(this.defaultTeamId)) || this.teams[0] || null;
                    if (team) this.applyTeam(team);
                    await this.loadPresets();
                }
            } finally {
                if (requestId === this.openRequestId) this.loading = false;
            }
        },
        reset() {
            this.openRequestId += 1;
            this.presetRequestId += 1;
            this.loading = false;
            this.form = createDefaultForm();
            this.presets = [];
            this.preset = "";
            this.isCustomEvent = false;
            this.sample = samples[0];
            this.team = null;
            this.processing = false;
            this.$refs.formRef?.clearValidate();
        },
        applyTeam(team) {
            this.team = team;
            this.form.team_id = team.ID;
            this.form.team_name = team.name;
            this.form.server = team.server;
            this.form.client = serverMap[team.server]?.client || this.$store.state.client;
            this.form.is_public = team.status ? 1 : 0;
        },
        async handleTeamChange(teamId) {
            const team = this.teams.find((item) => String(item.ID) === String(teamId));
            if (team) this.applyTeam(team);
            this.preset = "";
            await this.loadPresets();
        },
        async loadPresets() {
            const client = this.currentClient;
            const requestId = ++this.presetRequestId;
            const res = await getRaidPresets(client);
            if (requestId !== this.presetRequestId || client !== this.currentClient || !this.modelValue) return;
            this.presets = res?.data?.data || [];
            if (!this.isCustomEvent && this.presets.length) {
                this.preset = this.presets[0];
                this.handlePresetChange(this.preset);
            }
        },
        handlePresetChange(item) {
            if (!item) return;
            this.form.name = item.name;
            this.form.count = item.count;
            this.form.col = item.col;
            this.form.row = item.row;
        },
        toggleCustomEvent() {
            this.isCustomEvent = !this.isCustomEvent;
            if (this.isCustomEvent) {
                this.form.name = "";
                this.sample = samples[0];
                this.handleSizeChange(this.sample);
            } else if (this.presets.length) {
                this.preset = this.presets[0];
                this.handlePresetChange(this.preset);
            }
        },
        handleSizeChange(schema) {
            if (!schema || schema.key === "custom") return;
            this.form.row = schema.row;
            this.form.col = schema.col;
            this.form.count = schema.count;
        },
        async submit() {
            const valid = await this.$refs.formRef.validate().catch(() => false);
            if (!valid) return;

            if (!this.form.title) this.form.title = `【${this.form.team_name}】${this.form.name}`;
            if (this.isCustomEvent && this.isCustomSize) this.form.count = this.capacity;

            const data = pick({ ...this.form, client: this.currentClient }, [
                "team_id",
                "server",
                "client",
                "team_name",
                "name",
                "title",
                "desc",
                "leader",
                "auth",
                "start_time",
                "is_public",
                "auto_accept",
                "force_match",
                "count",
                "row",
                "col",
            ]);

            this.processing = true;
            try {
                const res = this.isEdit ? await updateRaid(this.raidId, data) : await addRaid(data);
                this.$message.success(this.$t(this.isEdit ? "team.raid.common.updated" : "team.raid.common.created"));
                this.$emit("saved", res?.data?.data || data);
                this.visible = false;
            } finally {
                this.processing = false;
            }
        },
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/form_dialog.less";
</style>
