import React, { Component, PropTypes } from "react";
import {BootstrapTable, TableHeaderColumn} from "react-bootstrap-table";
import FormField from "./FormField";
import _ from "lodash";
import {SEARCH_CONSTANT} from "../../constants/ApplicationConstants";

class Grid extends Component
{
    createNewCustomer(){
        if(this.props.onAddButtonClick){
            this.props.onAddButtonClick();
        }
    }
    _generateColumnGrid(){
        /*const options = { 
         page: 1,  // which page you want to show as default
         sizePerPageList: [ 5, 10, 15, 25, 50, 100 ], // you can change the dropdown list for size per page
         sizePerPage: 10,  // which size per page you want to locate as default
         pageStartIndex: 0, // where to start counting the pages
         paginationSize: 3,  // the pagination bar size.
         prePage: "Prev", // Previous page button text
         nextPage: "Next", // Next page button text
         firstPage: "First", // First page button text
         lastPage: "Last", // Last page button text
         paginationShowsTotal: false // Accept bool or function
         // hideSizePerPage: true > You can hide the dropdown for sizePerPage
         }; */
        const options = {
            sizePerPageList: [10, 25, 50, 100],
            hideSizePerPage: false,
        };
        const emptyOptions = {
            sizePerPageList: [0],
            noDataText: (<div className="font-size-11px"><span>Your search returned no results.</span> <span> Please select different criteria and perform the search again or </span> <span>{"Create New " + this.props.addNewButtonDisplayText}</span></div>), ///SEARCH_CONSTANT.ZERO_RECORDS_MESSAGE,
            hideSizePerPage: true
        };
    

        let _onRowSelect=(row, isSelected)=>{
            this.props.onRowSelect(row, isSelected);
        }

        let _onSelectAll=(isSelected)=>{

        }

        let searchMore=()=>{
            this.props.SearchMoreResult();
        }

        let addNewCustomer=()=>{
            this.props.onAddButtonClick();
        }

        let selectRowProp= ((this.props.selectType=="radio")?(
        {
            mode: "radio",
            clickToSelect: true,
            bgColor: "rgba(216, 226, 248, 1)",
            onSelect: _onRowSelect
        }):({
            mode: "checkbox",
            clickToSelect: true,
            bgColor: "rgba(216, 226, 248, 1)",
            onSelect: _onRowSelect,
            onSelectAll: _onSelectAll
        }));

        let isUnique = (data) => {
            let _tempData = _.uniqBy(data, "SsnTin");
            if(_tempData.length!=data.length)
            {
                return true;
            }
            return false;
        }

        let _Path = _.split(location.pathname, '/');
        return(<div>
            <div className="row">
                <div className="col-md-6">
                    <label><span className="bold pad-l-13px">Search Results: <span className="badge bg-blue">{((this.props.displayValue.length>100)?("100"):(this.props.displayValue.length))}</span></span> Records Found</label>
                </div>
                    <div className="pull-right pad-r-15px">
                    {((((isUnique(this.props.displayValue) || this.props.displayValue.length>100)) && _Path[3]=="Search")?(
                    <span><i className="mar-r-10px fa fa-search fa-md clr-blue" aria-hidden="true"></i>
                            <span className="link cursor-pointer" onClick={searchMore}>See more results...</span>
                    </span>):(""))}
                    <span className="mar-r-10px pad-l-13px clr-blue"><i className="mar-r-10px fa fa-user-plus" aria-hidden="true"></i><span onClick={addNewCustomer} className={(this.props.isAddNewBorrowerDisable!=undefined && this.props.isAddNewBorrowerDisable!=null && this.props.isAddNewBorrowerDisable==true)?("link cursor-pointer disabled"):("link cursor-pointer")}>{"Create New " + this.props.addNewButtonDisplayText}</span></span>
                  </div>
            </div>

            <BootstrapTable data={((this.props.displayValue.length>100)?(_.take(this.props.displayValue, 100)):(this.props.displayValue))} hover={this.props.hover} condensed={true} selectRow={selectRowProp} pagination={true} search={this.props.search} options={((this.props.displayValue.length!=0)?(options):(emptyOptions))}>
                <TableHeaderColumn  isKey={true} dataField="LegalEntityId" className="bold thead display-none" columnClassName="display-none">LegalEntity ID</TableHeaderColumn>
                <TableHeaderColumn dataField="LegalEntityName" className="bold thead width-15-per" columnClassName="" dataSort={this.props.sort} filter={((this.props.displayValue.length!=0)?({type: "TextFilter", placeholder: "Please enter a name"}):({}))}>Name</TableHeaderColumn>
                <TableHeaderColumn dataField="SsnTin" className="bold thead width-15-per" columnClassName="" dataSort={this.props.sort} filter={((this.props.displayValue.length!=0)?({type: "TextFilter", placeholder: "Please enter a TIN/SSN"}):({}))}>TIN/SSN</TableHeaderColumn>
                <TableHeaderColumn dataField="Address" className="bold thead column-word-wrap" columnClassName="column-word-wrap" dataSort={this.props.sort} filter={((this.props.displayValue.length!=0)?({type: "TextFilter", placeholder: "Please enter address"}):({}))}>Address</TableHeaderColumn>
            </BootstrapTable>
        </div>);
                }

    render() {
        return (<div>{this._generateColumnGrid()}</div>);
    }
}

Grid.propTypes = {
    id:PropTypes.string.isRequired,
    displayValue: PropTypes.array.isRequired,
    hover:PropTypes.bool,
    onRowSelect:PropTypes.func,
}

export default Grid;
