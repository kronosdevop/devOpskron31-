<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="rearrangeSectionDialog"
      @update:model-value="$emit('update:rearrangeSectionDialog', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Rearrange</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4">
          <v-list dense>
            <!-- Draggable component for the list -->
            <draggable v-model="arrayNew" @end="onDragEnd" :animation="200">
              <v-list-item
                v-for="(item, index) in arrayNew"
                :key="index"
                @mousedown.stop
                :draggable="true"
                class="custom-list-item"
              >
                <v-list-item-content>
                  <v-list-item-title class="white--text">{{
                    item.sectionTitle
                  }}</v-list-item-title>
                  <v-divider
                    v-if="index < arrayNew.length - 1"
                    :key="index"
                  ></v-divider>
                </v-list-item-content>
              </v-list-item>
            </draggable>
          </v-list>
          <!-- <div class="text-left">
              Are you sure you want to delete
              <b> {{ rowInfo.sectionTitle }} </b> ?
            </div> -->
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn depressed @click="delete_mutation()" dark class="cardCss">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
    <script>
/* eslint-disable */
// import draggable from "vuedraggable";
export default {
  props: {
    rearrangeSectionDialog: Boolean,
  },
  components: {
    // draggable,
  },
  watch: {
    rearrangeSectionDialog: {
      async handler() {
        if (this.rearrangeSectionDialog == true) {
          var data = JSON.parse(localStorage.getItem("localArray"));
          this.arrayNew = data;
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      loading: false,
      arrayNew: [],
    };
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    onDragEnd(event) {
      //   console.log(this.arrayNew);
    },
    delete_mutation() {
      this.$emit("arrayResponse", this.arrayNew);
    },
  },
};
</script>
<style scoped>
/* Optional styles for the draggable handle */
.v-list-item {
  cursor: move;
}
.custom-list-item {
  border: 1px solid black; /* Light border for each list item */
  background-color: #10559a; /* Light gray background color */
  margin-bottom: 4px; /* Space between items */
  transition: background-color 0.3s ease; /* Smooth background color transition */
}
.v-divider {
  margin: 0; /* Remove the default margin */
  border-color: #ddd; /* Border color for dividers */
}
</style>
