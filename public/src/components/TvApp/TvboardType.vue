<template>
  <div>
    <v-card flat class="mt-4">
      <v-toolbar dense flat>
        <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory dense>
          <v-btn small class="black--text" text value="orgtvboard">
            Organization TVBoards
          </v-btn>
          <v-btn small class="black--text" text value="tv_library">
            TVBoard Library
          </v-btn>
        </v-btn-toggle>

        <v-spacer />
        <v-btn
          dark
          @click="add_tvchannel()"
          v-if="toggle_exclusive == 'orgtvboard'"
          class="text-capitalize cardCss"
        >
          Create
        </v-btn>
        <v-btn dark class="text-capitalize ml-2 cardCss" @click="back_call()">
          <v-icon class="mr-2">mdi-step-backward</v-icon>
          Back
        </v-btn>
      </v-toolbar>
      <div class="text-left" v-if="toggle_exclusive == 'orgtvboard'">
        <TvboardList :key="subcribedKey" />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'tv_library'">
        <TvboardLibrary />
      </div>
    </v-card>
    <div v-if="componentCheck == 1">
      <CreatetvBoard
        :tvboardCreation="tvboardCreation"
        @clicked="tvboardCreation = false"
        v-on:updaterefesh="subcribedrefesh"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
  
  <script>
import SnackBar from "@/components/SnackBar.vue";
import CreatetvBoard from "@/components/TvApp/Popups/CreatetvBoard.vue";
import TvboardLibrary from "@/components/TvApp/TvboardLibrary.vue";
import TvboardList from "@/components/TvApp/TvboardList.vue";
export default {
  components: {
    TvboardList,
    TvboardLibrary,
    CreatetvBoard,
    SnackBar,
  },
  data: () => ({
    toggle_exclusive: null,
    componentCheck: 0,
    tvboardCreation: false,
    subcribedKey: 0,
    SnackBarComponent: {},
  }),
  created() {
    this.toggle_exclusive =
      this.$store.getters.Gettvboardback == false ? "orgtvboard" : "tv_library";
  },
  methods: {
    back_call() {
      this.$router.push("/AdminLevelApps");
    },
    add_tvchannel() {
      this.componentCheck = 1;
      this.tvboardCreation = true;
    },
    subcribedrefesh() {
      this.subcribedKey += 1;
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.tvboardCreation = false;
    },
    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },
  },
};
</script>
  
  <style>
</style>