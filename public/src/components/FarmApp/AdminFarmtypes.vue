<template>
  <div>
    <v-toolbar class="mt-4" flat>
      <v-row class="ml-4">
        <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory>
          <!-- <v-btn small class="black--text" text value="farmGroups">
            Group
          </v-btn> -->

          <v-btn small class="black--text" text value="farmcategories">
            Categories
          </v-btn>
          <v-btn small class="black--text" text value="farmss"> Farm </v-btn>
        </v-btn-toggle>
      </v-row>
      <v-spacer />
      <v-btn
        dark
        @click="add_categories()"
        v-if="toggle_exclusive == 'farmcategories'"
        class="text-capitalize cardCss"
      >
        Add Categories</v-btn
      >
      <v-btn
        dark
        @click="add_groups()"
        v-if="toggle_exclusive == 'farmGroups'"
        class="text-capitalize cardCss"
      >
        Add Group</v-btn
      >

      <v-btn
        dark
        @click="add_fields()"
        v-if="toggle_exclusive == 'farmss'"
        class="text-capitalize cardCss"
        >Add</v-btn
      >
      <v-btn dark class="text-capitalize ml-2 cardCss" @click="back_call()">
        <v-icon class="mr-2">mdi-step-backward</v-icon>
        Back
      </v-btn>
    </v-toolbar>
    <div class="text-left" v-if="toggle_exclusive == 'farmGroups'">
      <FarmGroup />
    </div>

    <div class="text-left" v-if="toggle_exclusive == 'farmcategories'">
      <FarmCategories />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'farmss'">
      <FarmList />
    </div>
    <div v-if="componentCheck == 1">
      <AddingFarm :addFields="addFields" @clicked="addFields = false" />
    </div>
    <div v-if="componentCheck == 2">
      <AddFarmgroup
        :createGroupDialog="createGroupDialog"
        @clicked="createGroupDialog = false"
      />
    </div>
    <div v-if="componentCheck == 3">
      <AddFarmCategories
        :addConfiguration="addConfiguration"
        @clicked="addConfiguration = false"
      />
    </div>
  </div>
</template>
            
    <script>
import AddFarmCategories from "@/components/FarmApp/Popups/AddFarmCategories.vue";
import AddFarmgroup from "@/components/FarmApp/Popups/AddFarmgroup.vue";
import AddingFarm from "@/components/FarmApp/Popups/AddingFarm.vue";
import FarmList from "@/components/FarmApp/FarmList.vue";
import FarmCategories from "@/components/FarmApp/FarmCategories.vue";
import FarmGroup from "@/components/FarmApp/FarmGroup.vue";
export default {
  components: {
    FarmList,
    AddingFarm,
    FarmCategories,
    FarmGroup,
    AddFarmgroup,
    AddFarmCategories,
  },
  data: () => ({
    toggle_exclusive: "farmcategories",
    addFields: false,
    createGroupDialog: false,
    addConfiguration: false,
    componentCheck: 0,
  }),
  methods: {
    back_call() {
      this.$router.push("/AdminLevelApps");
    },
    add_fields() {
      this.componentCheck = 1;
      this.addFields = true;
    },
    add_groups() {
      this.componentCheck = 2;
      this.createGroupDialog = true;
    },
    add_categories() {
      this.componentCheck = 3;
      this.addConfiguration = true;
    },
  },
};
</script>
            
    <style>
</style>