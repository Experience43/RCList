import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p v-if="i + 1 <= 150" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Password</div>
                            <p>{{ level.password || 'Free to Copy' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="selected + 1 <= 75"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
                    <p v-else-if="selected +1 <= 150"><strong>100%</strong> or better to qualify</p>
                    <p v-else>This level does not accept new records.</p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}Hz</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Website layout made by <a href="https://tsl.pages.dev/" target="_blank">TheShittyList</a></p>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3>Submission Requirements</h3>
                        <button @click="toggleLanguage" class="type-label-md" style="margin-bottom: 1rem;">
                            {{ showEnglish ? 'Tukar ke Bahasa Melayu' : 'Switch to English' }}
                        </button>
                        
                        <p v-for="(rule, index) in (showEnglish ? submissionRules.english : submissionRules.malay)" :key="index">{{ rule }}</p>
                        <p>
                            10) <a href="https://docs.google.com/spreadsheets/d/1evE4nXATxRAQWu2Ajs54E6cVUqHBoSid8I7JauJnOzg/edit?usp=drivesdk" style="color: #4454E0;" target="_blank"><u>Click here for banned hacks list</u></a>
                        </p>

                </div>
            </div>
        </main>
        
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store,
        showEnglish: false,
        submissionRules: {
            malay: [
            'Seperti di senarai yang lain, "hacks" yang memberi kelebihan kepada pemain adalah dilarang.',
            'Bagi yang menggunakan "FPS Bypass", had maksimum adalah 360fps/bps.',
            'Hanya warganegara Malaysia sahaja yang dibenarkan menghantar rekod mereka disini.',
            'Untuk level yang tiada dalam senarai Pointercrate, level tersebut akan diletakkan di senarai RCL menurut pendapat pemain.',
            'Kustom LDM sesebuah level boleh digunakan selagi ia tidak memudahkan level tersebut dari segi visual, melainkan ia adalah LDM yang telah dibuat oleh penerbit level tersebut. Rujuk kepada penyelia jika was-was.',
            '"Skip" sesebuah level boleh digunakan selagi ia hampir tidak mengubah kesukarannya secara ketara. Melainkan jika bahagian dalam level tersebut adalah bahagian tersusah, "skip" adalah dilarang.',
            'Rekod pertama dalam RCL mestilah disertakan dengan rakaman yang tidak disunting (raw footage).',
            'Rakaman bagi rekod mestilah disertakan dengan "attempt" sebelum level diselesaikan.',
            'Rekod mestilah disertakan dengan "endscreen" sesebuah level apabila ia sudah selesai.',
            '“Hacks” yang diharamkan oleh Pointercrate termasuk dalam peraturan RCL juga.',
            'Sekiranya pemain didapati menggunakan "hack" yang tidak dibenarkan dan menafikannya selepas disiasat, pemain tersebut akan disenarai hitam daripada menghantar rekod ke RCL selama yang diingin pemilik RCL.',
            'Rakaman mestilah sekurang-kurangnya 480p, atau pun selagi ia masih jelas untuk dilihat.',
            'Click Between Frame (CBF) dilarang sama sekali.',
            'Physics Bypass adalah dilarang sama sekali.',
            'Tetapi rekod menggunakan ia sebelum 22hb November 2024, 12:00 tengah malam tidak akan terkesan.',
        ],
        english: [
            'As in other lists, "hacks" that give players an unfair advantage are prohibited.',
            'For those using "FPS Bypass", the maximum limit is 360fps/bps.',
            'Only Malaysian citizens are allowed to submit their records here.',
            'For levels not listed on Pointercrate, they will be placed in the RCL list according to player opinion.',
            'Custom LDM for a level can be used as long as it does not make the level visually easier unless made by the level creator. Check with a moderator if unsure.',
            '"Skips" can be used as long as they do not significantly reduce difficulty. If the skipped part is the hardest, it’s forbidden.',
            'The first record in RCL must be accompanied by raw, unedited footage.',
            'Recordings must include the "attempt" before completing the level.',
            'Recordings must show the "endscreen" once the level is completed.',
            'Hacks banned by Pointercrate also apply to RCL. See more at the provided link.',
            'If a player is caught using prohibited hacks and denies it after investigation, they will be blacklisted from submitting to RCL for as long as desired by the owner.',
            'Recordings must be at least 480p, or otherwise clear enough to view.',
            'Click Between Frame (CBF) is strictly prohibited.',
            'Physics Bypass is strictly prohibited.',
            'However, records using it before 22nd November 2024, 12:00 midnight will not be affected.',
        ]
    }
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
        video() {
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();

        // Error handling
        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
        toggleLanguage() {
        this.showEnglish = !this.showEnglish;
    }
    },
};
