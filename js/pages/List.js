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
                    <p> 1) Seperti di senarai yang lain, "hacks" yang memberi kelebihan kepada pemain adalah dilarang. </p>
                    
                    <p> 2) Bagi yang menggunakan "FPS Bypass", had maksimum adalah 360fps/bps. </p>
                    
                    <p> 3) Hanya warganegara Malaysia sahaja yang dibenarkan menghantar rekod mereka disini. </p>							
								
                    <p> 4) Untuk level yang tiada dalam senarai Pointercrate, level tersebut akan diletakkan di senarai RCL menurut								
                    pendapat pemain. </p>								
                    								
                    <p> 5) Kustom LDM sesebuah level boleh digunakan selagi ia tidak memudahkan level tersebut dari segi visual, 								
                    melainkan ia adalah LDM yang telah dibuat oleh penerbit level tersebut. Rujuk kepada penyelia jika was-was. </p>								
                    								
                    <p> 6) "Skip" sesebuah level boleh digunakan selagi ia hampir tidak mengubah kesukarannya secara ketara. Melainkan 								
                    "jika bahagian dalam level tersebut adalah bahagian tersusah, ""skip"" adalah dilarang. </p>						
                    								
                    <p> 7) Rekod pertama dalam RCL mestilah disertakan dengan rakaman yang tidak disunting (raw footage). </p>							
                    								
                    <p> 8) Rakaman bagi rekod mestilah disertakan dengan "attempt" sebelum level diselesaikan. </p>								
                    								
                    <p> 9) Rekod mestilah disertakan dengan "endscreen" sesebuah level apabila ia sudah selesai. Ia bagi 								
                    "mencegah pemain daripada menyunting rekod tersebut dengan menyorok status ""endscreen"". </p>						
                    								
                    <p> 10) “Hacks” yang diharamkan oleh Pointercrate termasuk dalam peraturan RCL juga. Lihat di <a href = "https://docs.google.com/spreadsheets/d/1evE4nXATxRAQWu2Ajs54E6cVUqHBoSid8I7JauJnOzg/edit?usp=drivesdk"> sini: </a></p>								
                    								
                    <p> 11) Sekiranya pemain didapati menggunakan "hack" yang tidak dibenarkan oleh Pointercrate atau selainnya  								
                    dan pemain tersebut menafikannya selepas disiasat, pemain tersebut akan disenarai hitam daripada 								
                    menghantar rekod ke RCL selama yang diingin pemilik RCL. </p>							
                    								
                    <p> 12) Rakaman mestilah sekurang-kurangnya 480p, atau pun selagi ia masih jelas untuk dilihat. </p							
                    								
                    <p> 13) Click Between Frame (CBF) dilarang sama sekali. </p>							
                    								
                    <p> 14) Physics Bypass adalah dilarang sesama sekali. </p>								
                            <p> a) Tetapi rekod menggunakan ia sebelum 22hb November 2024, 12:00 tengah malam tidak akan terkesan. </p>
                                        
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
        store
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
    },
};
