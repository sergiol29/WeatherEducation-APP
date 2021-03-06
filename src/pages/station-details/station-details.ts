import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
 
/* Load Provider */
import { ApiProvider } from '../../providers/api/api';

/* LocalStorage */
import { LocalstorageProvider } from '../../providers/localstorage/localstorage';

/* Loading Spinner */
import { LoadingController } from 'ionic-angular';

/* Import Lib MomentJS */ 
import * as moment from 'moment';

/* Import for form */
import {Validators, FormBuilder, FormGroup } from '@angular/forms';

/* Modal */
import { ModalController } from 'ionic-angular';

/**
 * Generated class for the StationDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
 
@IonicPage()
@Component({
  selector: 'page-station-details',
  templateUrl: 'station-details.html',
})
export class StationDetailsPage {
  idStation: number;
  station: any; 
  nameAddress: any;

  /* Value for Taps Segment in view */
  segment: string = "graph";

  /* Variables Graph and Table */
  dataGraph = [];
  dataTable = [];
  rangeGraph: any;
  symbolGraph = [];  
  showMessageError: boolean = false;

  /* Variable form */
  form: FormGroup; 
  selectVariables = [];                
  selectRange = [
    { 'number': 3, 'time': 'hours' }, 
    { 'number': 9, 'time': 'hours' }, 
    { 'number': 24, 'time': 'hours' }, 
    { 'number': 7, 'time': 'days' }, 
    { 'number': 15, 'time': 'days' },
    { 'number': 30, 'time': 'days' }]; 
  
  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private loadingCtrl: LoadingController, private apiProv: ApiProvider, private fb: FormBuilder,
    private modalCtrl: ModalController, private storage: LocalstorageProvider) {
       
  } 

  ionViewDidLoad() { 
    this.idStation = this.navParams.get('id');

    let from = moment().subtract(3, 'hours').unix();
    this.getDataAPI(from);
  }

  /* Variable to is opcional */
  getDataAPI(from:number, to?:number) {
    /* Now timestamp */
    if( !to ) {
      to = moment().unix();  
    } 

    /* Create loading spinner */
    let loader = this.loadingCtrl.create({
      content: 'Please wait...',
    });

    /* Show loading spinner */
    loader.present().then(() => {
      /* Get data in API */
      this.apiProv.getShowStation(this.idStation, from, to).subscribe(
        (data) => {
          this.station = data;

          if( this.station['data'].length ) {
            /* Generate array for select variables in view */
            if(this.selectVariables.length != this.station['data'].length) {  
              this.generateSelectVariable(); 
            }
          }
          
          this.createForm();

          if( this.station['data'].length ) {  
            /* Generate data */
            this.generateDataGraphLines( this.getVariablesForm() );
            this.generateDataTable( this.getVariablesForm() );
            this.showMessageError = false; /* Dont show message not exist data at API */
          } else {
            /* Show message not exist data at API */
            this.showMessageError = true;
          }

          /* Hide loading spinner */
          loader.dismiss();
        });
    });
  }

  /* Created form */
  createForm() {
    /* If form is created, dont created again */
    if (this.form) {      
      /* If value at select variables not array then not exist value active and assigned value */
      if( this.selectVariables.length ) {        
        this.form.get('variables').setValue([this.selectVariables[0]]);
      }
      return;
    }
      
    /* Create form */
    this.form = this.fb.group({
      variables: [this.selectVariables[0], Validators.required],
      range: [this.selectRange[0], Validators.required],
    });
  }

  /* Complete values in select variables */
  generateSelectVariable() {
    let valuesDontShow = ['Latitud', 'Longitud'];
    let aux = [];    

    for( let data of this.station['data'] ) {
      /* Check if value inside in array  */
      if( valuesDontShow.indexOf(data.name) === -1 ) { 
        aux.push({ 'name': data.name, 'symbol': data.symbol, 'code': data.code });
      }
    }
      
    this.selectVariables = aux;
  }

  /* Get Range select in form for Graph */
  getRangeForm() {
    if( this.form.get('range').value != 'custom' ) {
      this.rangeGraph = this.form.get('range').value;
    }
  }

  /* Get Variables select in form for Graph */
  getVariablesForm() {
    let auxVariables = [];
    
    if( !Array.isArray( this.form.get('variables').value ) ) {      
      auxVariables.push( this.form.get('variables').value.code );
    } else if( !this.form.get('variables').value[0] != undefined ) {
      this.form.get('variables').value.forEach(element => { auxVariables.push(element.code) });
    }
    
    return auxVariables;
  }

  /* Read data for Graph */
  generateDataGraphLines(variables:any) {    
    this.dataGraph = [];
    this.getRangeForm();

    for( let data of this.station['data'] ) {
      /* Check if data.code exist in variables */ 
      if( variables.indexOf(data.code) !== -1 ) {
        this.symbolGraph.push(data.symbol);
        let aux = []; 
        let name = data.name + " (" + data.code + ")";   
        for( let values of data.values ) {
          aux.push( [values.timestamp * 1000, +values.value] );
        }
        this.dataGraph.push( {name: name, color: data.color, data: aux} ); /* Create Series */
      }
    }
  }

  /* Read data for Table */
  generateDataTable(variables:any) {    
    this.dataTable = [];
    for( let data of this.station['data'] ) {
      /* Check if data.code exist in variables */
      if( variables.indexOf(data.code) !== -1 ) {
        let aux = [];
        let name = data.name + " (" + data.code + ")";   
        for( let values of data.values ) {
          /* Convert Timestamp to Date */
          let date = moment.unix(values.timestamp).format("DD-MM-YYYY - HH:mm");
          aux.push( [date, values.value] );
        }
        this.dataTable.push( {name: name, symbol: data.symbol, data: aux} );
      }
    }
  }

  /* Control Change Select */
  onChangeVariable(variables:any) {
    if( variables[0] != undefined ) {
      let auxVariables = []; 
      variables.forEach(element => { auxVariables.push(element.code) });

      this.generateDataGraphLines(auxVariables);

      /* Data for table */
      this.generateDataTable(auxVariables);
    }
  }

  /* Control Change Select */
  onChangeRange(range:any) {
    let from = moment().subtract(range.number, range.time).unix();

    if( range != 'custom' ) {
      this.getDataAPI(from);
    } else {
      this.openModalCustomDate();
    }
  }

  openModalCustomDate(){
    /* Open Modal Page */
    let modal = this.modalCtrl.create('ModalPage',{},{showBackdrop:true, enableBackdropDismiss:true});

    /* When close modal refresh data */
    modal.onDidDismiss(data => {
      /* If data is !null, get data in API */
      if( data ) {
        this.getDataAPI( moment(data.from).unix(), moment(data.to).unix() );
        
        /* Calculate different day beetween dates */
        let from = moment(moment(data.from), "YYYYMMDD");
        let to = moment(moment(data.to), "YYYYMMDD");
        this.rangeGraph = { 'number': to.diff(from, "days"), 'time': 'days' };                
      } 
    });
   
    modal.present();
  }

  goToHome(id_user: number) {
    this.navCtrl.push('HomePage', { id: id_user });
  }

  getValuesMins(id_station: number) {
    this.navCtrl.push('ValuesMinsPage', { id: id_station });
  }

  getValuesMaxes(id_station: number) {
    this.navCtrl.push('ValuesMaxesPage', { id: id_station });
  }

  getConfigVariables(id_station: number) {
    this.navCtrl.push('ConfigVariablePage', {id: id_station});
  }

  logout() {
    this.storage.clearStorage();
    this.navCtrl.push('LoginPage');
  }
}
