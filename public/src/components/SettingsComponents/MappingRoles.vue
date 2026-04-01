<template>
  <div>
    <v-card flat>
      <v-card-text>
        <v-data-table
          :height="height"
          :fixed-header="fixed"
          :headers="headers"
          :items="tableData"
          :loading="tableLoading"
          :items-per-page="10"
          dense
          class="mt-n5 elevation-1 dtwidth"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon small color="red" @click="delete_user_items(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      height: 0,
      fixed: true,
      tableData: [],
      tableLoading: false,
      headers: [
        {
          text: "Role",
          value: "userName",
          sortable: false,
        },
        {
          text: "Mapped User",
          value: "department_head",
          sortable: false,
        },
      ],
    };
  },
  created() {
    this.height = window.innerHeight - 310;
  },
};
</script>