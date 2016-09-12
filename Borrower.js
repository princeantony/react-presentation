import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {  Router } from 'react-router'
import _ from 'lodash';
import toastr from 'toastr';
import moment from 'moment'; 

import { isValidDollarAmount, isValidEmail, isValidNumber, isRequired, isValidLength, validatePhoneNumber, checkPhoneLength, isDateValid } from '../utils/Functions';
import {BORROWER_CONSTANT, POSITION, FORMAT_CONSTANT, VALIDATION_CONSTANT} from '../constants/ApplicationConstants'
import {renderHyperLink, renderAccordion, renderSection} from './form-components/Form'
import FormField from './form-components/FormField'
import DomesticAddress from './DomesticAddress'
import InternationalAddress from './InternationalAddress'
import NewAddress from './NewAddress'
import Facilities from './Facilities'
import MismatchAddress from './MismatchAddress'
import {GetLegalEntity, GetLegalEntityCommonData} from '../actions/serviceAction'
import {SaveLegalEntity, CreateLegalEntity} from '../actions/borrowerAction' 
 
let showOnlyBFNABusinessAddress = false;
let showOnlyBFNAHomeAddress = false;
let showOnlyCCASBusinessAddress = false;
let showOnlyCCASHomeAddress = false;
let isDomestic = false;
let _borrowerId = 0;
let _tempBorrower={};
let addressFields= {};//copied
let billingAddress=null;
let primaryAddres=null;
let businessAddressMismatch=true;
let homeAddressMismatch=true;
let AddressType= [];
let isSave=0;
let objectCCASAddress=[];
let objectBFNAAddress=[];

let ccasBusinessAddress={};
let ccasHomeAddress={};
let bfnaBusinessAddress={};
let bfnaHomeAddress={};
class Borrower extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            borrowerInformationData: Object.assign({}, props.borrowerinformation),
            prevBorrowerInformationData: Object.assign({}, props.borrowerinformation),
            errors: {},
            saving: false,
            mobileErrorMessage:false,
            countryId :0,
            countryidforhome: 0
        };
        this.onFieldChange = this.onFieldChange.bind(this);
        this.onFieldBlur = this.onFieldBlur.bind(this);
    }

    componentWillMount() {
        this.props.actions.GetLegalEntityCommonData();
        if(this.props.params.id==="add") // when the user click on 'Add Borrower' button
        {
            this.props.actions.CreateLegalEntity(this.props.bfnaborrowerinformation);
        }
        else if(this.props.params.id==="active") // when the user click on 'Borrower' link which is on the left pane
        {

            if(this.props.borrowerinformation!=null)
            {
                  this.setState({ borrowerInformationData: Object.assign({}, this.props.borrowerinformation)});
                 this.setState({ prevBorrowerInformationData: Object.assign({}, this.props.borrowerinformation)});
            }
        }
        else if(this.props.params.id !== undefined) // when the user click on 'Continue' button
        {
            _borrowerId = this.props.params.id;
            this.props.actions.GetLegalEntity(_borrowerId);
        }
    }

    componentWillReceiveProps(nextProps) {
console.log("in receive ");
        if(this.props.borrowerinformation!=nextProps.borrowerinformation)
        {
            this.setState({ borrowerInformationData: Object.assign({}, nextProps.borrowerinformation)});
            this.setState({ prevBorrowerInformationData: Object.assign({}, nextProps.borrowerinformation)});
        }
        if(isSave!=0 && this.props.borrowerinformation!=nextProps.borrowerinformation)
        {
            this.setState({ borrowerInformationData: Object.assign({}, nextProps.borrowerinformation)});
            this.setState({ prevBorrowerInformationData: Object.assign({}, nextProps.borrowerinformation)});
            this.redirect();
        }

        /*this.setState({countryId: nextProps.borrowerinformation.Borrower.Addresses[0].CountryId});
         this.setState({countryidforhome: nextProps.borrowerinformation.Borrower.Addresses[0].CountryId});*/ 
    }

    componentWillUpdate(nextProps, nextState)
    {
        if(this.props.borrowerinformation!=nextProps.borrowerinformation)
        {
            this.setState({ borrowerInformationData: Object.assign({}, nextProps.borrowerinformation)});
            this.setState({ prevBorrowerInformationData: Object.assign({}, nextProps.borrowerinformation)});
        }
    }

    GetElementById(id)
    {
        if(id != null && id != undefined)
        {
            return document.getElementById(id).value;
        }
    }






    BorrowerFormIsValid()
    {
        let formIsValid = true;
        let _errors = {};
        let grossErrorMessage ="";
        
        if((this.state.borrowerInformationData.IsFTBEmployee!=true)&&(this.state.borrowerInformationData.EntityStructure.StructureCode.trim()=="I"))
        {
            /*Validate DollarFormate and Required field, Parameters(Value, ComponentName, IsRequired, ErrorMessage, showToastr) */
            grossErrorMessage = isValidDollarAmount(this.GetElementById("GrossAnnualRevenue"),'', true, VALIDATION_CONSTANT.GROSSREVENUE_MESSAGE,false );
            if(!grossErrorMessage)
            {
                /*Validate DollarFormate and Required field, Parameters(Value, ComponentName, MinLength, MaxLength, ErrorMessage, ShowToastr) */
                grossErrorMessage = isValidLength(this.GetElementById("GrossAnnualRevenue"),'', this.props.minLength, this.props.maxLength, VALIDATION_CONSTANT.GROSSREVENUE_MESSAGE, false)
            }
        }
        else if((this.state.borrowerInformationData.IsFTBEmployee!=true)&&(this.state.borrowerInformationData.EntityStructure.StructureCode.trim()!="I"))
        {
            grossErrorMessage = isValidDollarAmount(this.GetElementById("GrossRevenue"),'', true, VALIDATION_CONSTANT.GROSSREVENUE_MESSAGE,false );
            if(!grossErrorMessage)
            {
                grossErrorMessage = isValidDollarAmount(this.GetElementById("GrossRevenue"),'', this.props.minLength, this.props.maxLength, VALIDATION_CONSTANT.GROSSREVENUE_MESSAGE, false)
            }
        }
        if(grossErrorMessage){
            _errors.grossErrorMessage = grossErrorMessage;
        }

        /*Validate Email Format, Parameters(value, componentName, message, showToastr)*/
        let emailErrorMessage = isValidEmail(this.GetElementById("Email"),'', VALIDATION_CONSTANT.EMAIL_MESSAGE,false);
        if(emailErrorMessage){
            _errors.emailErrorMessage = emailErrorMessage
        }
        
        if(this.state.borrowerInformationData.EntityStructure.StructureCode.trim()!=="I")
        {
            /*Validate length, Parameters(Value, ComponentName, MinLength, MaxLength, Message, ShowToastr)*/
            let lengthErrorMessage = isValidLength(this.GetElementById("NumberOfEmployees"),'', false, VALIDATION_CONSTANT.TOTAL_NUMBER_OF_EMPLOYEE, VALIDATION_CONSTANT.NUMBEROFEMPLOYEE_MESSAGE,false);
            if(!lengthErrorMessage)
            {
                /*Validate Number Format, Parameters - (Value, ComponentName, LengthOfValue, Message, ShowToaser)*/
                lengthErrorMessage = isValidNumber(this.GetElementById("NumberOfEmployees"),'', false, VALIDATION_CONSTANT.NUMERIC_FORMAT_MESSAGE,false);
            }
            if(lengthErrorMessage){
                _errors.lengthErrorMessage = lengthErrorMessage;
            }
        }
    

        /*Phone number validation*/
        let isValidHome = validatePhoneNumber(this.GetElementById("HomePhone"));
        let isValidMobile = validatePhoneNumber(this.GetElementById("MobilePhone"));
        let isValidwork = validatePhoneNumber(this.GetElementById("WorkPhone"));

        let homePhoneLength = checkPhoneLength(this.GetElementById("HomePhone"));
        let mobilePhoneLength = checkPhoneLength(this.GetElementById("MobilePhone"));
        let workPhoneLength = checkPhoneLength(this.GetElementById("WorkPhone"));
       
        if((!isValidHome && !homePhoneLength) && (!isValidMobile && !mobilePhoneLength) && (!isValidwork && !workPhoneLength)){
            this.setState({mobileErrorMessage: VALIDATION_CONSTANT.PHONE_NUMBER_MESSAGE });
            _errors.phoneNumber = VALIDATION_CONSTANT.PHONE_NUMBER_MESSAGE;
        }
        else if((isValidHome && !homePhoneLength) || (isValidMobile && !mobilePhoneLength) || (isValidwork && !workPhoneLength)){
            this.setState({mobileErrorMessage: VALIDATION_CONSTANT.PHONE_NUMBER_NOTVALID});
            _errors.phoneNumber = VALIDATION_CONSTANT.PHONE_NUMBER_NOTVALID;
        }
        else{
            this.setState({mobileErrorMessage: ""});
        }

        /*NAICS code validation */
        if(document.getElementById("NAICSCode.Attribute") != null)
        {
            let naicsCodeError = isRequired(this.GetElementById("NAICSCode.Attribute"), '', "number", VALIDATION_CONSTANT.NAICS_CODE_ERROR, false); 
            if(!naicsCodeError)
            {
                naicsCodeError = isValidNumber(this.GetElementById("NAICSCode.Attribute"), '', 6, VALIDATION_CONSTANT.NAICS_CODE_ERROR, false); 
            }
            if(naicsCodeError)
            {
                _errors.naicsCodeError = naicsCodeError;
            }
        }

        if(this.state.borrowerInformationData.StructureCode.trim()=="I")
        {
            /* Validate Is Borrower US Citizen */
            if(document.getElementById("IsUSCitizen_true").checked != true && document.getElementById("IsUSCitizen_false").checked != true )
            {
                _errors.isUSCitizenError = "Is US Citizen can't be blank";
            }
        }

        /* Validate Is Mortgage Lender Citizen */
        if(document.getElementById("IsMortgageLender_true").checked != true && document.getElementById("IsMortgageLender_false").checked != true )
        {
            _errors.isMortgageLenderError = "Is Mortgage Lender can't be blank";
        }
        /*Check any error is available in page*/
        if( Object.keys(_errors).length > 0){
            formIsValid = false;
            this.setState({errors: _errors});
        }
        else{
            formIsValid = true;
        }

        return formIsValid;
    }

    isBoolean(value)
    {
        if(value=="true")
            return true;
        else if(value=="false")
            return false;
    }

    updateBorrower(e) {
        const fieldName = e.target.name;
        let fielValue=e.target.value;

        if((fielValue=="true" || fielValue=="false") && (e.target.type =="radio" || e.target.type =="checkbox"))
            fielValue = this.isBoolean(fielValue);
        else if((!isNaN(fielValue)) && (fielValue!=""))
            fielValue= Number(fielValue);

        _tempBorrower=this.state.borrowerInformationData;
        _.set(_tempBorrower, fieldName, fielValue);
        this.setState({borrowerInformationData: _tempBorrower});
    }

    validateData()
    {
        if(this.state.borrowerInformationData.IsFTBEmployee==true)
        {
            this.state.borrowerInformationData  = _.assign(this.state.borrowerInformationData, {
                GrossAnnualRevenue: this.state.prevBorrowerInformationData.GrossAnnualRevenue,
                GrossRevenue:this.state.prevBorrowerInformationData.GrossRevenue
            });
        }
    }

    _onDone(e){

        e.preventDefault();
        let isValid = '';
        isValid = this.BorrowerFormIsValid(this.state.borrowerInformationData);
        if(isValid){
            this.validateData();
            this.setState({saving: true});
            this.props.actions.SaveLegalEntity(this.state.borrowerInformationData);
            isSave=1;
            ///this.redirect();/// To DO: based on success navigate to Product Request page
        }
        else{
            toastr.error(VALIDATION_CONSTANT.SOME_FIELDS_NOT_VALID,'', {timeOut: 5500});
        }
    }

    redirect() {
        this.setState({saving: false});
        toastr.success('Borrower Information Saved');
        if(this.state.borrowerInformationData.EntityStructure.StructureCode.trim()=="I")
        {
            this.context.router.push('/LoanApp/LoanApplication/productRequest/0');
        }
    }

    onFieldChange(e){
        this.updateBorrower(e);
    }

    onFieldBlur(e){
        this.updateBorrower(e);
    }

 

    homeAddressClicked(e){
        if(e.target.id == e.target.name+"_0"){
            this.setState({countryidforhome : 223})
        }
        else{
            this.setState({countryidforhome : 0})
        }
    }

    //create CCAS Address Object
    
    CreateCCASObject(data){
        if(data != undefined){
            var ccasObject={
                "Line1":data.Line1,
                "Line2":data.Line2,
                "Region":data.Province,
                "City":data.City,
                "Zip":data.ZipCode
            }
            return ccasObject;
        }
        return null;
    }
    
    //create BFNA Object
    CreateBFNAObject(data){ 
        if(data != undefined){
            var bfnaObject={
                "Line1":data.AddressLine1,
                "Line2":data.AddressLine2,
                "Region":data.StateRegion,
                "City":data.City,
                "Zip":data.Zip
            }
            return bfnaObject;
        }
        return null;
    }

    //compare CCAS & BFNA Address, if no difference return true.
    CompareAddressMismatch(CCAS, BFNA){
        return (_.isEqual(CCAS, BFNA));
    }

    GetCCASAddress(_addressType)
    {
        if(this.props.borrowerinformation.Addresses != null)
        {
            this.props.borrowerinformation.Addresses.map(function(item, index){
                    if(item.AddressTypeId=== _addressType){
                        return  this.props.borrowerinformation.Addresses[index];
                    }
            })
            return null; 
        } 
        return null;
    }
   GetBFNABusinessAddress()
    {
         if(this.props.bfnaborrowerinformation.Address.Business)
        return this.props.bfnaborrowerinformation.Address.Business;
        else
        return null;
           
    }
       GetBFNAHomeAddress()
    {
        if(this.props.bfnaborrowerinformation.Address.Home)
        return this.props.bfnaborrowerinformation.Address.Home;
        else
        return null;
           
    }
    GetAddressType()
    {
        if(ccasBusinessAddress != null || ccasBusinessAddress.countryId != undefined || ccasBusinessAddress.countryId != null)
        {
                if(ccasBusinessAddress.countryId===223)
                {
                    isDomestic = true;
                }
        }
        else if(bfnaBusinessAddress.Country == null || bfnaBusinessAddress.Country == "US" || bfnaBusinessAddress.Country == undefined )
        {
            isDomestic = true;
        }
    }
    render() {
        AddressType=[{"Key": false,"Value": "Domestic"},{"Key": false,"Value": "International"}];
        let vertical=POSITION.VERTICAL;
        let horizontal=POSITION.HORIZONTAL;

        if(this.props.borrowerinformation==null || this.props.borrowercommondata == null){
            return(<div><FormField  type="spinner" /></div>)
        }
        let initialNaicsCode = this.props.initialNaicsCodeValue;
        
        AddressType.map((option, index) => {
            if(this.GetAddressType() && option.Value ==="Domestic"){
                AddressType[index].Key = true;
            }
            if(this.GetAddressType() && option.Value ==="International"){
                AddressType[index].Key = true;
            }
        })
        return(
            <div>
                {renderSection((BORROWER_CONSTANT.BORROWER_BUSINESS_INFORMATION),'panel','pnl-sub-header-green width-40-per pad-4px font-size-14px bold mar-l-5px','',
                    ([<div>
                        <form method="post" action="" key="borrowerForm" name="borrowerForm" id="borrowerForm" ref="borrowerForm" >
                            <fieldset className="brd-radius-3px mar-t-m-5px">
                                <div className="col-lg-12 pad-0px mar-0px">
                                    <div className="row mar-l-5px mar-r-5px pnl-brd-darkgray brd-radius-10px pad-14px">
                                        <div className="txt-aln-r col-lg-12">
                                            <label className="clr-red">* Required Fields</label>
                                        </div>
                                        <div className="pad-b-5px pad-l-5px pad-r-5px pad-t-25px font-size-11px">

                                            {/* Basic business information section */}
                                            {renderAccordion((BORROWER_CONSTANT.BASIC_BUSINESS_INFORMATION), 'panel accordion-brd-color font-size-12px', 'accordion-panel pad-4px bold', '', '',
                                                ([<div className="row">
                                                    <FormField columnSize={3} key="EntityStructure.Desc"  name="EntityStructure.Desc" orientation={vertical} type="label-group" displayText={BORROWER_CONSTANT.ENTITY_STRUCTURE} displayValue={this.state.borrowerInformationData.EntityStructure.Desc} />
                                                    {((this.state.borrowerInformationData.EntityStructure.StructureCode.trim()!=="I")?(<FormField columnSize={3} key="LegalName"  name="LegalName" orientation={vertical} type="label-group" displayText={BORROWER_CONSTANT.BUSINESS_NAME} displayValue={this.state.borrowerInformationData.LegalName} />):(<div><FormField columnSize={3} orientation={vertical} key="FirstName"  name="FirstName" type="label-group" displayText={BORROWER_CONSTANT.BORROWER_FIRST_NAME} displayValue={this.state.borrowerInformationData.FirstName} /><FormField columnSize={3} orientation={vertical} key="MiddleName"  name="MiddleName" type="label-group" displayText={BORROWER_CONSTANT.BORROWER_MIDDLE_NAME} displayValue={this.state.borrowerInformationData.MiddleName} /><FormField columnSize={3} orientation={vertical} key="LastName"  name="LastName" type="label-group" displayText={BORROWER_CONSTANT.BORROWER_LAST_NAME} displayValue={this.state.borrowerInformationData.LastName} /></div>))}
                                                    <FormField columnSize={3} orientation={vertical} key={((this.state.borrowerInformationData.EntityStructure.StructureCode.trim()!=="I")?("SocialSecurityNumber"):("TaxId"))}  name={((this.state.borrowerInformationData.EntityStructure.StructureCode.trim()!=="I")?("TaxId"):("SocialSecurityNumber"))} type="label-group" displayText={BORROWER_CONSTANT.SSN_ITIN_OR_EIN} displayValue={((this.state.borrowerInformationData.EntityStructure.StructureCode.trim()!=="I")?(this.state.borrowerInformationData.TaxId):(this.state.borrowerInformationData.SocialSecurityNumber))} />
                                                    <FormField columnSize={3} orientation={vertical} key="YearBusinessStarted"  name="YearBusinessStarted" type={((this.state.borrowerInformationData.YearBusinessStarted)?("label-group"):("date"))} displayText={BORROWER_CONSTANT.DATE_BUSINESS_STARTED} displayValue={this.state.borrowerInformationData.YearBusinessStarted} />
                                                </div>])
                                            )}
            
        {/*-- Compare CCAS & BFNA Address--*/}
        
    { 
           if(this.props.borrowerinformation.EntityStructure.StructureCode.trim()==="I")
        {
            ccasBusinessAddress = this.GetCCASAddress("E");
            ccasHomeAddress = this.GetCCASAddress("P");

            bfnaBusinessAddress = this.GetBFNABusinessAddress();
            bfnaHomeAddress = this.GetBFNAHomeAddress();
            GetAddressType() ;// to know the address type is Domestic or International

            (renderAccordion((BORROWER_CONSTANT.BUSINESS_ADDRESS),'panel accordion-brd-color font-size-12px', 'accordion-panel pad-4px bold', '','',
            (<div>
            <div className="row">
                <FormField columnSize={4} orientation={horizontal} id="rdoisBusinessDomestic" type="radio" name="businessAdress" 
                displayText={BORROWER_CONSTANT.ADDRESS_TYPE} displayValue={AddressType} isDisabled="true" 
                defaultOption={isDomestic}/>
            </div>
            if(ccasBusinessAddress != null && bfnaBusinessAddress != null )
            {
                let objectCCASBusinessAddress=this.CreateCCASObject(ccasBusinessAddress)
                let objectBFNABusinessAddress=this.CreateBFNAObject(bfnaBusinessAddress)
        
                if(!this.CompareAddressMismatch(objectCCASBusinessAddress, objectBFNABusinessAddress))
                {
                    <MismatchAddress type={"Borrower"} objectCCASAddress={objectCCASBusinessAddress} objectBFNAAddress={objectBFNABusinessAddress} />
                }
                else{
                    <div>
                (!isDomestic) ?(
                        <InternationalAddress addressType="businessType" defaultSelectValue={ccasBusinessAddress.CountryId} isDisabled = "true" 

businessAddress={ccasBusinessAddress} commonData={this.props.borrowercommondata.Countries}/>
                    ):(
                        <DomesticAddress addressType="businessType" defaultSelectValue={ccasBusinessAddress.State} isDisabled = "true"  borrowerinformation=

{ccasBusinessAddress} commonData={this.props.borrowercommondata.States}/>
                    )
                    <Facilities addressType="businessType" borrowerinformation={this.props.borrowercommondata.Facilities}/>
                    </div>
                }
            }
            else if(ccasBusinessAddress != null)
            {
                <div>
                    (!isDomestic) ?(
                        <InternationalAddress addressType="businessType" defaultSelectValue={ccasBusinessAddress.CountryId} isDisabled = "true" 

businessAddress={ccasBusinessAddress} commonData={this.props.borrowercommondata.Countries}/>
                    ):(
                        <DomesticAddress addressType="businessType"  defaultSelectValue={ccasBusinessAddress.State} isDisabled = "true"  

borrowerinformation={ccasBusinessAddress} commonData={this.props.borrowercommondata.States}/>
                    )
                    <Facilities addressType="businessType" borrowerinformation={this.props.borrowercommondata.Facilities}/>
                </div>
            }
            else if(bfnaBusinessAddress != null)
            {
                <div>
                    (!isDomestic) ?(
                        <InternationalAddress addressType="businessType" isDisabled = "true" businessAddress={bfnaBusinessAddress} commonData=

{this.props.borrowercommondata.Countries}/>
                    ):(
                        <DomesticAddress addressType="businessType"  isDisabled = "true"  borrowerinformation={bfnaBusinessAddress} commonData=

{this.props.borrowercommondata.States}/>
                    )
                    <Facilities addressType="businessType" borrowerinformation={this.props.borrowercommondata.Facilities}/>
                </div>
            }
        </div>
         )))

    {/* Home section */}

    (renderAccordion((BORROWER_CONSTANT.HOME_ADDRESS),'panel accordion-brd-color font-size-12px', 'accordion-panel pad-4px bold', '','',
(
    <div>
         <div className="row">
            <FormField columnSize={4} orientation={horizontal} id="rdoisBusinessDomestic" type="radio" name="businessAdress"
            displayText={BORROWER_CONSTANT.ADDRESS_TYPE} displayValue={AddressType} isDisabled="true" 
            defaultOption={isDomestic}/>
        </div>
            if(ccasHomeAddress != null && bfnaHomeAddress != null )
            {
                let objectCCASHomesAddress=this.CreateCCASObject(ccasHomeAddress)
                let objectBFNAHomeAddress=this.CreateBFNAObject(bfnaHomeAddress)
        
                if(!this.CompareAddressMismatch(objectCCASHomesAddress, objectBFNAHomeAddress))
                {
                    <MismatchAddress type={"Borrower"} objectCCASAddress={objectCCASHomesAddress} objectBFNAAddress={objectBFNAHomeAddress} />
                }
                else{
                    <div>
                (!isDomestic) ?(
                        <InternationalAddress addressType="businessType" isDisabled = "true" businessAddress={ccasHomeAddress} commonData=

{this.props.borrowercommondata.Countries}/>
                    ):(
                        <DomesticAddress addressType="businessType"  isDisabled = "true"  borrowerinformation={ccasHomeAddress} commonData=

{this.props.borrowercommondata.States}/>
                    )
                    <Facilities addressType="businessType" borrowerinformation={this.props.borrowercommondata.Facilities}/>
                    </div>
                }
            }
            else if(ccasHomeAddress != null)
            {
                <div>
                    (!isDomestic) ?(
                        <InternationalAddress addressType="businessType" isDisabled = "true" businessAddress={ccasHomeAddress} commonData=

{this.props.borrowercommondata.Countries}/>
                    ):(
                        <DomesticAddress addressType="businessType"  isDisabled = "true"  borrowerinformation={ccasHomeAddress} commonData=

{this.props.borrowercommondata.States}/>
                    )
                    <Facilities addressType="businessType" borrowerinformation={this.props.borrowercommondata.Facilities}/>
                </div>
            }
            else if(bfnaHomeAddress != null)
            {
                <div>
                    (!isDomestic) ?(
                        <InternationalAddress addressType="businessType" isDisabled = "true" businessAddress={bfnaHomeAddress} commonData=

{this.props.borrowercommondata.Countries}/>
                    ):(
                        <DomesticAddress addressType="businessType"  isDisabled = "true"  borrowerinformation={bfnaHomeAddress} commonData=

{this.props.borrowercommondata.States}/>
                    )
                    <Facilities addressType="businessType" borrowerinformation={this.props.borrowercommondata.Facilities}/>
                </div>
            }
         </div>
    ))) }// End of ondividual
        else{
    (renderAccordion((BORROWER_CONSTANT.BUSINESS_ADDRESS),'panel accordion-brd-color font-size-12px', 'accordion-panel pad-4px bold', '','',
    ( <div>
         <div className="row">
            <FormField columnSize={4} orientation={horizontal} id="rdoisBusinessDomestic" type="radio" name="businessAdress" 
            displayText={BORROWER_CONSTANT.ADDRESS_TYPE} displayValue={AddressType} isDisabled="true" 
            defaultOption={isDomestic}/>
        </div>
            if(ccasBusinessAddress != null && bfnaBusinessAddress != null )
            {
                let objectCCASBusinessAddress=this.CreateCCASObject(ccasBusinessAddress),
                let objectBFNABusinessAddress=this.CreateBFNAObject(bfnaBusinessAddress)
        
                if(!this.CompareAddressMismatch(objectCCASBusinessAddress, objectBFNABusinessAddress))
                {
                    <MismatchAddress type={"Borrower"} objectCCASAddress={objectCCASBusinessAddress} objectBFNAAddress={objectBFNABusinessAddress} />
                }
                else{
                    <div>
                (!isDomestic) ?(
                        <InternationalAddress addressType="businessType" isDisabled = "true" businessAddress={ccasBusinessAddress} commonData=

{this.props.borrowercommondata.Countries}/>
                    ):(
                        <DomesticAddress addressType="businessType"  isDisabled = "true"  borrowerinformation={ccasBusinessAddress} commonData=

{this.props.borrowercommondata.States}/>
                    )
                    <Facilities addressType="businessType" borrowerinformation={this.props.borrowercommondata.Facilities}/>
                    </div>
                }
            }
            else if(ccasBusinessAddress != null)
            {
                <div>
                    (!isDomestic) ?(
                        <InternationalAddress addressType="businessType" isDisabled = "true" businessAddress={ccasBusinessAddress} commonData=

{this.props.borrowercommondata.Countries}/>
                    ):(
                        <DomesticAddress addressType="businessType"  isDisabled = "true"  borrowerinformation={ccasBusinessAddress} commonData=

{this.props.borrowercommondata.States}/>
                    )
                    <Facilities addressType="businessType" borrowerinformation={this.props.borrowercommondata.Facilities}/>
                </div>
            }
            else if(bfnaBusinessAddress != null)
            {
                <div>
                    (!isDomestic) ?(
                        <InternationalAddress addressType="businessType" isDisabled = "true" businessAddress={bfnaBusinessAddress} commonData=

{this.props.borrowercommondata.Countries}/>
                    ):(
                        <DomesticAddress addressType="businessType"  isDisabled = "true"  borrowerinformation={bfnaBusinessAddress} commonData=

{this.props.borrowercommondata.States}/>
                    )
                    <Facilities addressType="businessType" borrowerinformation={this.props.borrowercommondata.Facilities}/>
                </div>
            }
         </div>
    )))

       }
       }    
    // End of ondividual
        
       
       


                                            {/* Phone number section */}
                                            {renderAccordion((BORROWER_CONSTANT.PHONE_NUMBERS), 'panel accordion-brd-color font-size-12px', 'accordion-panel pad-4px bold', '', '',
                                                ([<div>
                                                    {((this.state.mobileErrorMessage)?(<div>
                                                        <div className="txt-aln-r col-lg-12">
                                                            <label className="clr-red">{this.state.mobileErrorMessage}</label>
                                                        </div>
                                                    </div>):(''))}
                                                    <div className="row">
                                                        <FormField columnSize={4} orientation={vertical} key="WorkPhone" name="WorkPhone" dataMask={FORMAT_CONSTANT.US_PHONE_NUMBER_MASK} faClass="fa-phone label-color" type="text"   onFieldBlur={this.onFieldBlur} displayText={BORROWER_CONSTANT.BUSINESS} displayValue={this.state.borrowerInformationData.WorkPhone} />
                                                        <FormField columnSize={4} orientation={vertical} key="MobilePhone" name="MobilePhone" dataMask={FORMAT_CONSTANT.US_PHONE_NUMBER_MASK} faClass="fa-mobile label-color font-size-14px bold" type="text"   onFieldBlur={this.onFieldBlur} displayText={BORROWER_CONSTANT.HOME} displayValue={this.state.borrowerInformationData.MobilePhone} />
                                                        <FormField columnSize={4} orientation={vertical} key="HomePhone" name="HomePhone" dataMask={FORMAT_CONSTANT.US_PHONE_NUMBER_MASK} faClass="fa-phone label-color" type="text"   onFieldBlur={this.onFieldBlur} displayText={BORROWER_CONSTANT.OTHER}  displayValue={this.state.borrowerInformationData.HomePhone} />
                                                    </div>
                                                </div>])
                                            )}

                                            {/* Other details section */}
                                            {renderAccordion((BORROWER_CONSTANT.OTHER_DETAILS), 'panel accordion-brd-color font-size-12px', 'accordion-panel pad-4px bold', '', '',
                                                ([<div>{((this.state.borrowerInformationData.EntityStructure.StructureCode.trim()!=="I")?(<div className="row">
                                                    <FormField columnSize={4} orientation={vertical} name="presentMagmntSince"   type="date" displayText={BORROWER_CONSTANT.PRESENT_MANAGEMENT_SINCE} />
                                                    <FormField columnSize={4} orientation={vertical} name="NumberOfEmployees" type="number"   onFieldBlur={this.onFieldBlur} displayText={BORROWER_CONSTANT.TOTAL_NUMBER_OF_EMPLOYEES} displayValue={this.state.borrowerInformationData.NumberOfEmployees} checkNumberFormat={true} digitLength={false} maxLength={VALIDATION_CONSTANT.TOTAL_NUMBER_OF_EMPLOYEE} errorMessage={VALIDATION_CONSTANT.NUMBEROFEMPLOYEE_MESSAGE} />
                                                    <FormField columnSize={4} orientation={vertical} name="BusinessFormationState" type={((this.state.borrowerInformationData.BusinessFormationState)?("label-group"):("text"))} displayText={BORROWER_CONSTANT.FORMATION_STATE} displayValue={this.state.borrowerInformationData.BusinessFormationState} />
                                                </div>):(''))}</div>,
                                                    <div>{((this.state.borrowerInformationData.EntityStructure.StructureCode.trim()==="I")?(<div className="row"><FormField columnSize={4} orientation={horizontal} name="IsFTBEmployee" type="radio" displayText={BORROWER_CONSTANT.ARE_YOU_A_FIFTH_THIRD_EMPLOYEE} onFieldChange={this.onFieldChange}  defaultOption={this.state.borrowerInformationData.IsFTBEmployee} isRequired={true} /></div>):(''))}</div>,
                                                    <div className="row">
                                                        <FormField columnSize={4} orientation={vertical} name="Email" faClass="fa-envelope label-color" type="email"   onFieldBlur={this.onFieldBlur} displayText={BORROWER_CONSTANT.BUSINESS_EMAIL_ADDRESS} displayValue={this.state.borrowerInformationData.Email} errorMessage={VALIDATION_CONSTANT.EMAIL_MESSAGE} />
                                                    {(((this.state.borrowerInformationData.IsFTBEmployee!=true)&&(this.state.borrowerInformationData.EntityStructure.StructureCode.trim()=="I"))?(<FormField columnSize={4} orientation={vertical} name="GrossAnnualRevenue" faClass="fa-usd label-color font-size-14px bold" type="text" isRequired={true} onFieldBlur={this.onFieldBlur} displayText={BORROWER_CONSTANT.GROSS_ANNUAL_INCOME} displayValue={this.state.borrowerInformationData.GrossAnnualRevenue} isDollarRequired={true} dollarFormat={true} minLength={false} maxLength={VALIDATION_CONSTANT.GROSS_REVENUE_AMOUNT} errorMessage={VALIDATION_CONSTANT.GROSSREVENUE_MESSAGE} />):(''))}
                                                    {(((this.state.borrowerInformationData.IsFTBEmployee!=true)&&(this.state.borrowerInformationData.EntityStructure.StructureCode.trim()!="I"))?(<FormField columnSize={4} orientation={vertical} name="GrossRevenue" faClass="fa-usd label-color font-size-14px bold" type="text" isRequired={true} onFieldBlur={this.onFieldBlur} displayText={BORROWER_CONSTANT.GROSS_ANNUAL_REVENUE} displayValue={this.state.borrowerInformationData.GrossRevenue} help="Gross Annual Revenue must be less than $1 billion" isDollarRequired={true} dollarFormat={true} checkLength={true} minLength={false} maxLength={VALIDATION_CONSTANT.GROSS_REVENUE_AMOUNT} errorMessage={VALIDATION_CONSTANT.GROSSREVENUE_MESSAGE}  />):(''))}
                                                    </div>,
                                                    <div>{((this.state.borrowerInformationData.EntityStructure.StructureCode.trim()==="I")?(<div className="row"><FormField columnSize={4} orientation={horizontal} name="IsUSCitizen" type="radio" displayText={BORROWER_CONSTANT.IS_BORROWER_US_CITIZEN} defaultOption={this.state.borrowerInformationData.IsUSCitizen} onFieldChange={this.onFieldChange} isRequired={true} /></div>):(''))}</div>,
                                                    <div className="row"><FormField columnSize={4} orientation={horizontal} name="IsMortgageLender" type="radio" displayText={BORROWER_CONSTANT.IS_BORROWER_A_MORTGAGE_LENDER}  defaultOption={this.state.borrowerInformationData.IsMortgageLender} onFieldChange={this.onFieldChange} isRequired={true} /></div>,
                                                    <div className="row">
                                                    <FormField columnSize={4} orientation={vertical}  name={((initialNaicsCode=='' || initialNaicsCode=="000000" || initialNaicsCode==null )? ("NAICSCode.Attribute"):("NAICSCode.Attribute_label"))}  type={((initialNaicsCode=='' || initialNaicsCode=="000000" || initialNaicsCode==null )?("number"):("label-group"))} onFieldBlur={this.onFieldBlur} displayText={BORROWER_CONSTANT.NAICS_CODE} displayValue={this.state.borrowerInformationData.NAICSCode.Attribute} isRequired={true} required={true} checkNumberFormat={true} digitLength={6} errorMessage={"NAICS Code should be 6 digit"} node={[<div className="pad-t-5px font-size-11px">{renderHyperLink('lnkNaicsCode','NAICS Code Lookup','#', 'normal')}</div>]}/>
                                                    <FormField columnSize={4} orientation={vertical} name="NAICSCode.Description" type="label-group" displayText={BORROWER_CONSTANT.NAICS_CODE_DESCRIPTION} displayValue={this.state.borrowerInformationData.NAICSCode.Description} />
                                                </div>])
                                            )}
                                        </div>
                                        <div className="col-lg-12 pad-t-0px pad-b-13px">
                                            <input type="button" className="btn btn-primary pull-right" value="Next"  onClick={this._onDone.bind(this)}/>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                        </form>
                    </div>]))}
            </div>);
    }
}

Borrower.propTypes = {
    borrowerinformation: PropTypes.object.isRequired,
    bfnaborrowerinformation: PropTypes.object.isRequired,
    borrowercommondata:PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
};

//Pull in the React Router context so router is available on this.context.router.
Borrower.contextTypes = {
    router: PropTypes.object
};

let mapStateToProps = (state, ownProps) => {

    return {
        borrowerinformation: state.loanAppReducer.LoanApplication.Borrower,
        bfnaborrowerinformation: state.loanAppReducer.LoanAppInputData.Borrower,
        initialNaicsCodeValue : state.loanAppReducer.LoanApplication.Borrower == null?"": state.loanAppReducer.LoanApplication.Borrower.NAICSCode.Attribute,
        borrowercommondata : state.loanAppReducer.LegalEntityCommonData,
    };
}

function mapDispatchToProps(dispatch) {
    return  {
        actions: bindActionCreators({GetLegalEntity:GetLegalEntity,
            SaveLegalEntity:SaveLegalEntity,
            CreateLegalEntity:CreateLegalEntity,
            GetLegalEntityCommonData: GetLegalEntityCommonData
        }, dispatch)
    };
}

export default connect(mapStateToProps,mapDispatchToProps)(Borrower);



