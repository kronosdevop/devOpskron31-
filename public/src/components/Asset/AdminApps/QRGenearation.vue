<template>
  <div>
    <v-card flat>
      <v-form ref="from1">
        <v-toolbar flat class="mt-n2" dense>
          <!-- <v-select
            outlined
            dense
            v-model="categoryName"
            :items="assetCategoriesList"
            class="mt-7"
            item-text="text"
            :rules="[(v) => !!v || 'required ']"
            item-value="value"
            style="max-width: 300px"
            label="Category Name"
            @input="fetch_sub_data()"
          /> -->
          <!-- <v-select
            outlined
            dense
            class="mt-7 ml-3"
            v-model="subcategory"
            :items="assetSubCategoriesList"
            item-text="text"
            item-value="value"
            style="max-width: 300px"
            label="Sub Category"
          /> -->
          <v-select
            density="compact"
            variant="outlined"
            v-model="noOfQR"
            class="mt-7"
            :rules="[(v) => !!v || 'required ']"
            :items="[5, 10, 25, 50, 100]"
            style="max-width: 300px"
            maxlength="2"
            label="Total number of QR codes"
          />

          <v-btn
            @click="validate_data()"
            :loading="loading"
            dark
            class="text-capitalize cardCss button-corner mt-9 ml-4"
          >
            Generate
          </v-btn>
          <v-spacer />
          <v-btn
            @click="export_reports()"
            class="mx-2"
            dark
            fab
            v-show="selectedQrs.length != 0"
            :loading="exportloading"
            small
            color="primaryColor"
          >
            Export
            <!-- <v-icon dark> mdi-export </v-icon> -->
          </v-btn>
        </v-toolbar>
      </v-form>
      <v-card-text>
        <v-data-table
          v-model="selectedQrs"
          :headers="qrHeaders"
          :fixed-header="fixed"
          :items="qrData"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          density="compact"
          item-key="asset_qr_id"
          :multi-select="true"
          show-select
          class="elevation-1 dtwidth"
        >
          <!-- @click:row="handle_row_click" -->
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              color="primaryColor"
              class="mr-2"
              small
              @click.stop="open_editDailog(item)"
              >mdi-download</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
      <!-- <v-card-text>
        <strong>
          <v-checkbox
            v-model="autoapprove"
            label="Approval/Acknowledgment Required For Transfer Of Asset"
          ></v-checkbox>
        </strong>
      </v-card-text> -->
      <!-- <v-card-actions class="justify-start">
        <v-btn
          @click="validate_data()"
          :loading="loading"
          dark
          class="text-capitalize cardCss button-corner ml-2"
        >
          Save
        </v-btn>
      </v-card-actions> -->
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/*eslint-disable*/
import SnackBar from "@/components/SnackBar.vue";
import { get_asset_categories } from "@/mixins/GetAssetCategoryList.js";
import { get_asset_sub_categories } from "@/mixins/GetAssetSubCategories.js";
import { asset_genrate_list_print_qrs } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

const FileSaver = require("file-saver");
import axios from "axios";

export default {
  components: {
    SnackBar,
  },
  mixins: [get_asset_categories, get_asset_sub_categories],

  data() {
    return {
      selectedQrs: [],
      autoapprove: false,
      loading: false,
      SnackBarComponent: {},
      subcategory: "",
      categoryName: "",
      noOfQR: null,
      assetCategoriesList: [],
      assetSubCategoriesList: [],
      tableLoading: false,
      fixed: true,
      qrHeaders: [
        { title: "QR Codes", key: "asset_qr_label", sortable: false },
        // { text: "Status", key: "", sortable: false },

        // { text: "No.Of QR", key: "category_id_text", sortable: false },

        // { text: "Actions", key: "actions", sortable: false },
      ],
      qrData: [],
      allsubCategories: [],
      exportloading: false,
    };
  },
  async created() {
    this.tableLoading = true;
    await this.generated_qr("LIST");
    this.tableLoading = false;
    // await this.get_asset_categories();
    // await this.get_asset_sub_categories();
    //
    // this.assetCategoriesList = this.assetCategories;
  },
  methods: {
    fetch_sub_data() {
      var filteredArray = this.assetSubCategories.filter(
        (obj) => obj.category_id === this.categoryName
      );
      this.assetSubCategoriesList = [];
      filteredArray.forEach((element) => {
        this.assetSubCategoriesList.push({
          text: element.sub_category_name,
          value: element.sub_category_id,
        });
      });
    },

    is_Number(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },

    validate_data() {
      if (this.$refs.from1.validate()) {
        this.loading = true;
        this.generated_qr("GENRATE");
      }
    },

    export_reports() {
      this.exportloading = true;
      this.generated_qr("EXPORT");
    },

    fetch_qr_ids() {
      var data = [];
      this.selectedQrs.forEach((element) => {
        data.push(element.asset_qr_id);
      });
      return data;
    },

    async generated_qr(value) {
      try {
        let result = await API.graphql(
          graphqlOperation(asset_genrate_list_print_qrs, {
            input: {
              action_type: value,
              no_of_qrs: value == "GENRATE" ? Number(this.noOfQR) : undefined,
              asset_qr_id: value == "EXPORT" ? this.fetch_qr_ids() : undefined,
            },
          })
        );

        this.loading = false;
        this.exportloading = false;
        var response = JSON.parse(result.data.asset_genrate_list_print_qrs);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.loading = false;
          if (value == "GENRATE") {
            this.generated_qr("LIST");
          }
          if (value == "EXPORT") {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: response.Message,
              timeout: 5000,
              Top: true,
            };
            this.selectedQrs = [];
            this.download_invoice(response.data);
          }
          // console.log(value, response.data);
          if (value == "LIST") {
            this.exportloading = false;
            this.qrData = response.data;
          } else {
            this.$refs.from1.reset();
          }
          // this.$emit("successMsg", response.Message);
          // this.$emit("updaterefesh", "update");
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          // this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
        // this.$emit("errorMsg", error.errors[0].message);
      }
    },

    async download_invoice(url) {
      this.exportloading = false;
      var fileName = "QR" + ".xlsx";
      axios({
        url: url,
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
          console.error("Error downloading the file:", error);
        });
    },
  },
};
</script>

<style>
</style>
<!--------------------------------------------------------------------------------------->
<!-- 
<template>
  <v-card flat class="mt-10">
    <v-card-text>
      <v-dialog
        ref="dialog"
        v-model="endmodal"
        color="primaryColor"
        persistent
        width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-model="formattedDate"
            dense
            outlined
            persistent-hint
            label="Select Date"
            readonly
            color="primaryColor"
            append-icon="mdi-calendar"
            style="max-width: 350px; margin-top: -60px"
            @click:append="openDatePicker"
            v-bind="attrs"
            v-on="on"
          >
          </v-text-field>
        </template>
        <v-date-picker
          v-model="tempDate"
          :max="new Date().toISOString().substr(0, 10)"
          :min="minmonth"
          color="primaryColor"
          scrollable
        >
          <v-spacer></v-spacer>
          <v-btn text color="primaryColor" @click="closeDatePicker">
            Cancel
          </v-btn>
          <v-btn text color="primaryColor" @click="saveDate"> OK </v-btn>
        </v-date-picker>
      </v-dialog>

      {{ selectedDate }}
    </v-card-text>
  </v-card>
</template>

<script>
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import { format_Date } from "@/JsonFiles/DateFormate.js";
import { formatTime } from "@/JsonFiles/DateFormate.js";
import { formatDatepicker } from "@/JsonFiles/DateFormate.js";
export default {
  data() {
    return {
      endmodal: false,
      CurrentDate: new Date().toISOString().substr(0, 10),
      minmonth: "2023-01-01",
      selectedDate: new Date().toISOString().substr(0, 10),
      tempDate: new Date().toISOString().substr(0, 10),
    };
  },
  computed: {
    formattedDate() {
      return formatDatepicker(this.selectedDate, "MMM-dd-yyyy");
    },
  },
  created() {
    const timestamp = 1719917348;
   
  },
  methods: {
    openDatePicker() {
      this.tempDate = this.selectedDate;
      this.endmodal = true;
    },
    saveDate() {
      this.selectedDate = this.tempDate;
      this.endmodal = false;
    },
    closeDatePicker() {
      this.tempDate = this.selectedDate;
      this.endmodal = false;
    },
  },
};
</script> -->

<!----------------------------------------------------------------------->
<!--   multiple date picker-->
<!-- <template>
  <v-card flat class="mt-10">
    <v-card-text>
      <v-toolbar flat>
        <v-dialog
          ref="dialog"
          v-model="startModal"
          color="primaryColor"
          persistent
          width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="formattedStartDate"
              dense
              outlined
              persistent-hint
              label="From Date"
              readonly
              color="primaryColor"
              append-icon="mdi-calendar"
              style="max-width: 350px; margin-top: -60px"
              @click:append="openStartDatePicker"
              v-bind="attrs"
              v-on="on"
            >
            </v-text-field>
          </template>
          <v-date-picker
            v-model="startDate"
            :max="new Date().toISOString().substr(0, 10)"
            :min="minStartDate"
            color="primaryColor"
            scrollable
          >
            <v-spacer></v-spacer>
            <v-btn text color="primaryColor" @click="closeStartDatePicker">
              Cancel
            </v-btn>
            <v-btn text color="primaryColor" @click="saveStartDate"> OK </v-btn>
          </v-date-picker>
        </v-dialog>

        <v-dialog
          ref="dialog2"
          v-model="endModal"
          color="primaryColor"
          persistent
          width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="formattedEndDate"
              dense
              outlined
              persistent-hint
              label="To Date"
              readonly
              color="primaryColor"
              append-icon="mdi-calendar"
              style="max-width: 350px; margin-top: -60px"
              @click:append="openEndDatePicker"
              v-bind="attrs"
              v-on="on"
            >
            </v-text-field>
          </template>
          <v-date-picker
            v-model="endDate"
            :max="new Date().toISOString().substr(0, 10)"
            :min="startDate"
            color="primaryColor"
            scrollable
          >
            <v-spacer></v-spacer>
            <v-btn text color="primaryColor" @click="closeEndDatePicker">
              Cancel
            </v-btn>
            <v-btn text color="primaryColor" @click="saveEndDate"> OK </v-btn>
          </v-date-picker>
        </v-dialog></v-toolbar
      >

      {{ selectedStartDate }} to {{ selectedEndDate }}
    </v-card-text>
  </v-card>
</template>

<script>
import { formatDatepicker } from "@/JsonFiles/DateFormate.js";

export default {
  data() {
    return {
      startModal: false,
      endModal: false,
      CurrentDate: new Date().toISOString().substr(0, 10),
      minStartDate: "2023-01-01",
      selectedStartDate: new Date().toISOString().substr(0, 10),
      selectedEndDate: new Date().toISOString().substr(0, 10),
      startDate: new Date().toISOString().substr(0, 10),
      endDate: new Date().toISOString().substr(0, 10),
    };
  },
  computed: {
    formattedStartDate() {
      return formatDatepicker(this.selectedStartDate, "MMM-dd-yyyy");
    },
    formattedEndDate() {
      return formatDatepicker(this.selectedEndDate, "MMM-dd-yyyy");
    },
  },
  methods: {
    openStartDatePicker() {
      this.startDate = this.selectedStartDate;
      this.startModal = true;
    },
    saveStartDate() {
      this.selectedStartDate = this.startDate;
      this.startModal = false;
    },
    closeStartDatePicker() {
      this.startDate = this.selectedStartDate;
      this.startModal = false;
    },
    openEndDatePicker() {
      this.endDate = this.selectedEndDate;
      this.endModal = true;
    },
    saveEndDate() {
      this.selectedEndDate = this.endDate;
      this.endModal = false;
    },
    closeEndDatePicker() {
      this.endDate = this.selectedEndDate;
      this.endModal = false;
    },
  },
};
</script> -->
