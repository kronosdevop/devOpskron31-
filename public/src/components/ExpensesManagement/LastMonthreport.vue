<template>
  <div>
    <v-card flat >
      <v-card-text>
        <!-- <v-toolbar flat  class="pt-2 bg-white"> -->
          <!-- <v-menu
              ref="menu"
              v-model="monthdailog"
              :close-on-content-click="false"
              :return-value.sync="date"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="auto"
            >
              <template #activator="{ on, attrs }">
                <v-text-field
                  v-model="date1"
                  label="Select a Month"
                  readonly
                  dense
                  v-bind="attrs"
                  style="max-width: 200px"
                  class=""
                  outlined
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                :max="new Date().toISOString().substr(0, 10)"
                v-model="date"
                type="month"
                no-title
                color="primaryColor white--text"
                scrollable
              >
                <v-spacer></v-spacer>
                <v-btn text color="primaryColor" @click="monthdailog = false">
                  Cancel
                </v-btn>
                <v-btn
                  text
                  color="primaryColor"
                  @click="$refs.menu.save(date)"
                  v-on:click="get_next()"
                >
                  OK
                </v-btn>
              </v-date-picker>
            </v-menu> -->
          <!-- <v-spacer /> -->
          <!-- <v-btn
              depressed
              @click="exportreport()"
              dark
              class="text-capitalize cardCss ml-2 mt-n6"
            >
              Export
            </v-btn> -->
        <!-- </v-toolbar> -->
       <div class="table-container">

          <div class="table-wrapper">
   <v-data-table
      fixed-header
      height="320"
      :headers="headers"
      :items="paginatedItems"
      :loading="tableLoading"
      hide-default-footer
      class="modern-data-table"
      hover
    >
<template #body.prepend>
  <tr v-if="tableLoading">
    <td :colspan="headers.length" class="loader-td">
      <div class="loader-center">
        <v-progress-circular
          indeterminate
          size="42"
          width="3"
          color="primary"
        />
        <div class="loader-text">Loading records…</div>
      </div>
    </td>
  </tr>
</template>
  </v-data-table>

  <div class="table-footer">
    <div class="footer-info">
      {{
        totalItems === 0
          ? "No Results"
          : `Showing ${paginatedItems.length} of ${totalItems} records`
      }}
    </div>

    <div class="pagination-controls">
      <v-btn
        :disabled="currentPage === 1"
        variant="text"
        size="small"
        class="pagination-btn"
        @click="currentPage--"
      >
        Previous
      </v-btn>

      <div class="page-numbers">
        <v-btn
          v-for="page in visiblePages"
          :key="page"
          size="small"
          :class="page === currentPage ? 'active-page' : 'inactive-page'"
          @click="currentPage = page"
        >
          {{ page }}
        </v-btn>
      </div>

      <v-btn
        :disabled="currentPage === pageCount"
        variant="text"
        size="small"
        class="pagination-btn"
        @click="currentPage++"
      >
        Next
      </v-btn>
    </div>
  </div>
</div>
      
          
        </div>
      </v-card-text>
    </v-card>
    <ExportGroupAndCat
      :selectedData="selectedData"
      :ExportreportDialog="ExportreportDialog"
      :datevalue="datevalue"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
      v-on:SuccessURL="download_item"
      @clicked="ExportreportDialog = false"
    />
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
  
  <script>
import { API, graphqlOperation } from "aws-amplify";
import { expense_reports_graph } from "@/graphql/queries.js";
import ExportGroupAndCat from "@/components/ExpensesManagement/ExpensePopups/ExportGroupAndCat.vue";
import SnackBar from "@/components/SnackBar.vue";
const FileSaver = require("file-saver");
import axios from "axios";

export default {
  components: {
    ExportGroupAndCat,
    SnackBar,
  },
  data() {
    return {
        headers:[
      {title:"Group Name", value:"group_name"},
      {title:"Expense", value:"expense"},
      {title:"Petty Cash" , value:"pettycash"},
      {title:"Total" , value:"total"}
    ],
        tableLoading: false,
    tableItems: [],  
              currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
      formattedmonth: "",
      formattedyear: "",
      selectedData: "",
      ExportreportDialog: false,
      datevalue: "",
      SnackBarComponent: {},
      section_value: [],
      monthdailog: false,
      fixed: true,
      date1:
        [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ][Number(new Date().toISOString().split("T")[0].split("-")[1]) - 1] +
        " " +
        new Date().toISOString().split("T")[0].split("-")[0],
      date: new Date().toISOString().substr(0, 7),
      updatekey: 0,
   
    };
  },
  watch: {
        currentPage(newVal) {
                const table = document.querySelector(".modern-data-table");
                if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
              },
              tableData: {
                handler(newVal) {
                  const maxPage = Math.ceil(this.totalItems / this.itemsPerPage);
                  if (this.currentPage > maxPage && maxPage > 0) {
                    this.currentPage = 1;
                  }
                },
                deep: true,
              },
    date(val) {
      this.date1 =
        [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ][Number(val.split("-")[1]) - 1] +
        " " +
        val.split("-")[0];
    },
  },
  mounted() {
    this.get_next();
  },
   computed: {
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableItems.slice(start, end);
    },
  
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
  
    visiblePages() {
      const delta = 2;
      let start = Math.max(1, this.currentPage - delta);
      let end = Math.min(this.pageCount, this.currentPage + delta);
  
      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  methods: {
    exportreport() {
      // console.log("item", item)
      this.selectedData = "MyGroup";
      this.ExportreportDialog = true;
      this.datevalue = this.date1;
    },

    async download_item(url) {
      let firstName =
        this.$store.getters.GetUserObj?.organization?.organization_team_id;
      let fileNames = firstName
        ? firstName + "_" + "LastMonth" + ".xlsx"
        : "_" + "LastMonth" + ".xlsx";
      try {
        const response = await axios({
          url: url,
          method: "GET",
          responseType: "blob",
        });
        if (!response.data) {
          throw new Error("No data received from the server.");
        }
        const fileName = fileNames;
        const blob = new Blob([response.data], {
          type: response.headers["content-type"] || "application/octet-stream",
        });

        FileSaver.saveAs(blob, fileName);
      } catch (error) {
        // console.error("Error downloading the file:", error);
      }
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };

      this.ExportreportDialog = false;

      this.get_next();
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
    fecth_date() {
      const [month, year] = this.date1.split(" ");

      const monthMap = {
        January: "01",
        February: "02",
        March: "03",
        April: "04",
        May: "05",
        June: "06",
        July: "07",
        August: "08",
        September: "09",
        October: "10",
        November: "11",
        December: "12",
      };

      this.formattedmonth = `${monthMap[month]}`;
      this.formattedyear = `${year}`;
      this.formattedmonth = parseInt(this.formattedmonth, 10);
      this.formattedyear = parseInt(this.formattedyear, 10);
    },
    async get_next() {
                    this.tableLoading = true; 
      
      await this.fecth_date();
      var data = this.$store.getters.GetUserObj;

      // Add null check for user data
      if (!data || !data.organization || !data.organization.organization_id) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "User data not available",
          timeout: 5000,
          Top: true,
        };
        return;
      }

      try {
        let result = await API.graphql(
          graphqlOperation(expense_reports_graph, {
            input: {
              organization_id: data.organization.organization_id,
              // year: this.formattedyear,
              // month: this.formattedmonth,
              action_type: "HalfYearTransactions",
              sub_action_type:"BY_GROUP"
            },
          })
        );
        let resultdata = JSON.parse(result.data.expense_reports_graph);
        if (resultdata.Status == "SUCCESS") {
              this.tableItems = resultdata.data || [];
                      this.tableItems = resultdata.data || [];
                    this.totalItems = this.tableItems.length;
                    this.currentPage = 1;// reset page
          let response = resultdata.data;
          if (resultdata.data.length > 0) {
            this.section_value = [];
            this.section_value = [
              {
                name: "Expenses",
                data: response,
              },
            ];
          
            this.updatekey++;
                                              this.tableItems = resultdata.data
            
          } else {
            this.section_value = [];
            this.updatekey++;
          }
        } else {
          this.section_value = [];
          this.updatekey++;
        }
      } catch (error) {
                          this.tableItems = [];
        
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors?.[0]?.message || "An error occurred",
          timeout: 5000,
          Top: true,
        };
        this.section_value = [];
      }
       finally{
            this.tableLoading = false;
        
      }
    },
  },
};
</script>
  
  <style scoped>
.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
  width: 100%;
  text-align: center;
  font-size: 20px;
}
.table-wrapper {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 4%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Table itself */
.modern-data-table {
  background: white;
}

/* Header */
.modern-data-table thead th {
  background: #ffffff;
  font-weight: 600;
  font-size: 14px;
  color: #222;
  border-bottom: 1.5px solid #e0e0e0;
  padding: 14px 12px;
}

/* Rows */
.modern-data-table tbody tr {
  height: 50px;
  border-bottom: 1px solid #e6e6e6;
}

.modern-data-table tbody tr:last-child {
  border-bottom: none;
}

/* Cells */
.modern-data-table tbody td {
  font-size: 14px;
  color: #222;
  padding: 12px;
}
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-top: 1px solid #e0e0e0;
  background: #ffffff;
}

.footer-info {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pagination-btn {
  text-transform: none;
  font-size: 14px;
}

.active-page {
  background: #db4c77 !important;
  color: white !important;
  min-width: 36px;
  height: 36px;
}

.inactive-page {
  color: #666;
  min-width: 36px;
  height: 36px;
}
.modern-data-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
  background: white;
}
/* Loader cell takes full width */
.loader-td {
  padding: 0 !important;
  text-align: center;
}

/* Perfect center */
.loader-center {
  height: 360px; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loader-text {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}

</style>