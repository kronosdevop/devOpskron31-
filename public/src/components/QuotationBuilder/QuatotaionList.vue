<template>
  <div style="padding-bottom: 70px">
    <!-- <SnackBar :SnackBarComponent="SnackBarComponent" /> -->
    <!-- <v-toolbar class="" dense flat >
      <v-btn-toggle v-model="adminToggle" color="grey" mandatory>
        <v-btn small class="black--text" text value="apps"> Quotation </v-btn>
        <v-btn small class="black--text" text value="audit">
          T&S Configuration
        </v-btn>
      </v-btn-toggle>
      <v-spacer />
      <v-btn @click="generate_action()" class="cardCss text-capitalize" dark
        >Generate
      </v-btn>
    </v-toolbar> -->
    <v-card class="mt-4" flat >
      <v-card-text>
        <v-data-table
          :fixed-header="fixed"
          :headers="headers"
          :items="paginatedItems"
          :loading="tableLoading"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalCount"
          hide-default-footer
          class="elevation-2 dtwidth text-caption rounded-lg"
          density="compact"
          hover
          multi-sort
          @update:sort-by="handleSortChange"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey lighten-1" class="mb-4"
                >mdi-file-document-outline</v-icon
              >
              <div class="text-h6 grey--text mb-2">No Quotations Found</div>
              <div class="text-body-2 grey--text">
                Try generating a new quotation or check your filters.
              </div>
            </div>
          </template>

          <template v-slot:loading>
            <div class="text-center py-8">
              <v-progress-circular
                indeterminate
                color="primary"
                size="32"
                class="mb-4"
              ></v-progress-circular>
              <div class="text-body-2 grey--text">Loading quotations...</div>
            </div>
          </template>

          <template v-slot:[`item.genreted_on`]="{ item }">
            <span>{{ get_updatedate(item.genreted_on) }}</span>
          </template>
          <template v-slot:[`item.genrated_by`]="{ item }">
            <span>{{ fetch_name(item.genrated_by) }}</span>
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              icon
              color="green"
              size="x-small"
              @click="download_item(item)"
            >
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </template>
        </v-data-table>

        <!-- Footer bar always rendered -->
        <div
          class="footer-bar d-flex align-center justify-space-between px-6 py-2"
          style="min-height: 56px; background: #f7f8fa"
        >
          <div class="text-caption ml-4" style="color: black; font-size: 14px">
            {{
              totalCount === 0
                ? "No Results"
                : (currentPage - 1) * itemsPerPage +
                  1 +
                  " to " +
                  Math.min(currentPage * itemsPerPage, totalCount) +
                  " of " +
                  totalCount +
                  " Results"
            }}
          </div>
          <div class="pagination-container d-flex align-center mr-4">
            <v-pagination
              v-model="currentPage"
              :length="pageCount"
              active-color="primary"
              density="comfortable"
              class="pagination-footer"
              :total-visible="5"
              next-icon="mdi-chevron-right"
              prev-icon="mdi-chevron-left"
              @update:modelValue="updatePageItems"
            />
          </div>
        </div>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
<script>
/*eslint-disable*/
import QuotationGeneration from "@/components/QuotationBuilder/QuotationGeneration.vue";
import TermsConditions from "@/components/QuotationBuilder/TermsConditions.vue";
import { genrate_list_quotaions_bills } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
const FileSaver = require("file-saver");
import axios from "axios";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { get_termsAndcondition_list } from "@/mixins/GetTermsandConditionList";
import SnackBar from "@/components/SnackBar.vue";

export default {
  mixins: [get_all_org_users, get_termsAndcondition_list],
  components: {
    QuotationGeneration,
    TermsConditions,
    SnackBar,
  },
  data() {
    return {
      fixed: true,
      headers: [
        { title: "Quotation No", value: "ref_no", sortable: false },
        { title: "Customer", value: "genrated_by", sortable: false },
        { title: "Generated On", value: "genreted_on", sortable: false },
        { title: "Status", value: "report_status", sortable: false },
        { title: "Action", value: "action", sortable: false },
      ],
      tableLoading: false,
      tableData: [],
      SnackBarComponent: {},
      // Pagination properties
      paginatedItems: [],
      itemsPerPage: 10,
      currentPage: 1,
      sortBy: [{ key: "ref_no", order: "asc" }],
    };
  },

  async mounted() {
    this.tableLoading = true;
    await this.get_all_org_users();
    await this.fetch_Quotation_list();
    await this.get_termsAndcondition_list();
    this.allUSersNames = this.orgUsers;
    this.updatePageItems(); // Initialize paginated items
  },

  watch: {
    currentPage() {
      this.updatePageItems();
    },
  },

  methods: {
    fetch_user_list() {
      this.userProfiles = {};
      localStorage.setItem("allOrgUsers", JSON.stringify(this.orgUsers));
      this.orgUsers.forEach((element) => {
        if (element.user_status === "ACTIVE") {
          const email = element.user_email_id;
          const profilePicUrl = element.user_profile_pic_url || "";
          const name = element.full_user_name;
          if (profilePicUrl && profilePicUrl != "N/A") {
            this.$set(this.userProfiles, email, profilePicUrl);
          } else {
            const initials = this.getInitials(name);
            this.$set(this.userProfiles, email, initials);
          }
        }
      });
    },

    fetch_name(value) {
      var data = "";
      this.orgUsers.forEach((element) => {
        if (element.user_email_id == value) {
          data = element.full_user_name;
        }
      });
      return data;
    },

    get_updatedate(date) {
      if (date != "" && date != undefined) {
        return formatedatetime(date);
      }
    },
    generate_action() {
      this.$router.push("/QuotationGeneration");
    },

    updatePageItems() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.paginatedItems = this.sortedAndPaginatedItems.slice(
        startIndex,
        endIndex
      );
    },

    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
      this.updatePageItems();
    },

    getSortValue(value, key) {
      if (!value) return "";
      if (key === "ref_no" || key === "genrated_by") {
        return value.toLowerCase();
      }
      return value;
    },

    async fetch_Quotation_list() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(genrate_list_quotaions_bills, {
            input: {
              action_type: "LIST",
              type: "QUOTATION",
            },
          })
        );
        this.tableLoading = false;
        var response = JSON.parse(result.data.genrate_list_quotaions_bills);
        this.tableLoading = false;

        if (response.Status == "SUCCESS") {
          this.tableData = response.data;
          this.updatePageItems(); // Update paginated items after data is loaded
          // console.log("tableData", this.tableData)
        }
      } catch (error) {
        this.tableLoading = false;
        console.error(error);
      }
    },

    async download_item(item) {
      // console.log(item);
      let firstName =
        this.$store.getters.GetUserObj?.organization?.organization_team_id;
      let fileName = firstName
        ? firstName + "_" + item.ref_no + ".pdf"
        : "_" + item.ref_no + ".pdf";
      // var fileName = item.ref_no + ".xlsx";
      axios({
        url: item.url,
        method: "GET",
        responseType: "blob", // Set the response type to blob
      })
        .then((response) => {
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });

          // Use the FileSaver library to save the file
          FileSaver.saveAs(blob, fileName);
        })
        .catch((error) => {
          // console.error("Error downloading the file:", error);
        });
    },
  },

  computed: {
    totalCount() {
      return this.tableData.length;
    },
    pageCount() {
      return Math.ceil(this.totalCount / this.itemsPerPage);
    },
    sortedAndPaginatedItems() {
      // First sort the filtered items
      const sortedItems = this.tableData.slice().sort((a, b) => {
        for (const sort of this.sortBy) {
          const aValue = this.getSortValue(a[sort.key], sort.key);
          const bValue = this.getSortValue(b[sort.key], sort.key);

          if (aValue < bValue) return sort.order === "asc" ? -1 : 1;
          if (aValue > bValue) return sort.order === "asc" ? 1 : -1;
        }
        return 0;
      });

      return sortedItems;
    },
  },
};
</script>

<style scoped>
.footer-bar {
  background: #f7f8fa;
  min-height: 56px;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  border-radius: 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  width: 100%;
}

.pagination-container {
  min-width: 160px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.pagination-footer {
  margin: 0;
  padding: 0;
  display: inline-flex;
}

.pagination-footer :deep(.v-pagination__list) {
  background: transparent;
  justify-content: flex-end;
}

.pagination-footer :deep(.v-pagination__item) {
  border-radius: 50%;
  margin: 0 2px;
}

.pagination-footer :deep(.v-pagination__item--is-active) {
  background-color: var(--v-primary-base);
  color: white;
}

.dtwidth {
  border-radius: 8px;
  overflow: hidden;
}

.dtwidth :deep(.v-data-table__wrapper) {
  border-radius: 8px;
}

.dtwidth :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.dtwidth :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}
</style>