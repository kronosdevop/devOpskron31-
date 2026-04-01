<template>
  <!-- eslint-disable -->
  <v-dialog
    :model-value="viewChecklistDialog"
    @update:model-value="$emit('update:viewChecklistDialog', $event)"
    persistent
    max-width="800"
    transition="dialog-top-transition"
  >
    <v-card>
      <v-toolbar elevation="0" dark density="compact" class="navBar">
        <v-toolbar-title class="text--black ml-2"
          ><div class="custom-title">View Checklist Master</div>
        </v-toolbar-title>
        <v-spacer />
        <v-icon class="icon-class mr-4" @click="close_dialog()"
          >mdi-close</v-icon
        >
      </v-toolbar>

      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12">
            <strong>Name:</strong> {{ ChecklistItem.checklist_name || "N/A" }}
          </v-col>
          <v-col cols="12">
            <strong>Description:</strong>
            {{ ChecklistItem.checklist_description || "N/A" }}
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <div v-if="ChecklistItem.section && ChecklistItem.section.length">
          <div
            v-for="(entry, index) in ChecklistItem.section"
            :key="index"
            class="mb-4"
          >
            <!-- Section Item -->
            <v-card
              v-if="entry.type === 'section'"
              outlined
              class="rounded-lg"
              elevation="1"
            >
              <v-card-title>
                <v-icon color="blue darken-2" class="mr-2"
                  >mdi-folder-plus</v-icon
                >
                <span class="font-weight-medium">{{ entry.name }}</span>
              </v-card-title>

              <v-card-text>
                <v-list dense>
                  <div v-for="(item, i) in entry.items" :key="'item-' + i">
                    <v-list-item class="pl-6">
                      <v-list-item-icon>
                        <v-avatar size="20" color="blue lighten-4" class="mr-2">
                          <span
                            class="text-caption grey--text text--darken-3"
                            >{{ i + 1 }}</span
                          >
                        </v-avatar>
                      </v-list-item-icon>

                      <v-list-item-content>
                        <v-list-item-title class="font-weight-medium">
                          {{ item.name }}
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-body-2">
                          {{ item.description || "No description provided." }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>

                    <!-- Divider after item, except last one -->
                    <v-divider
                      v-if="i !== entry.items.length - 1"
                      class="ml-10 mr-2"
                    />
                  </div>
                </v-list>
              </v-card-text>
            </v-card>

            <!-- Line Item -->
            <v-card v-else outlined elevation="1" class="rounded-lg">
              <v-card-title>
                <v-icon color="green darken-2" class="mr-2"
                  >mdi-format-line-weight</v-icon
                >
                <span class="font-weight-medium">{{ entry.name }}</span>
              </v-card-title>

              <v-card-text>
                <div class="text-body-2">
                  {{ entry.description || "No description provided." }}
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>
        <div v-else>
          <em>No checklist items available.</em>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

  
<script>
export default {
  props: {
    ChecklistItem: Object,
    viewChecklistDialog: Boolean,
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
  },
};
</script>
  
  <style>
</style>