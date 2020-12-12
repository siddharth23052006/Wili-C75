import React, {Component} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Image, KeyboardAvoidingView, ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import { TextInput } from 'react-native-gesture-handler';
import db from '../Config';
import firebase from 'firebase';

export default class BookTransactionScreen extends Component{
  constructor(){
    super();
    this.state = {
      hasCameraPermissions: null,
      scanned: false,
      scannedData: '',
      buttonState: 'normal',
      scannedBookId: '',
      scannedStudentId: '',
      transactionMessage: ''
    }
  }

  handleTransaction = async ()=>{
    /*var transactionMessage;
    db.collection('books').doc(this.state.scannedBookId).get()
    .then(doc =>{
      var book = doc.data();
      if(book.bookAvailability){
        this.initiateBookIssue();
        transactionMessage = "Book Issued";
      }
      else{
        this.initiateBookReturn();
        transactionMessage = "Book Returned";
      }
    });
    //ToastAndroid.show(transactionMessage, ToastAndroid.SHORT);
    this.setState({transactionMessage:transactionMessage});*/
    var transactionType = await this.checkBookAvailability();
    if (!transactionType){
      alert('The book does not exist in the library database');
      this.setState({scannedBookId:'', scannedStudentId:''});
    }
    else if(transactionType === 'Issue'){
      var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
      if (isStudentEligible){
        this.initiateBookIssue();
        alert('Book issued to the student.');
      }
    }
    else{
      var isStudentEligible = await this.checkStudentEligibilityForBookReturn();
      if (isStudentEligible){
        this.initiateBookReturn();
        alert('Book returned to the library.');
      }
    }
  }

  checkBookAvailability = async ()=>{
    const bookRef = await db.collection('books').where("bookId", "==", this.state.scannedBookId)
    .get();
    var transactionType = '';
    if (bookRef.docs.length === 0){
      transactionType = false;
    }
    else {
      bookRef.docs.map(doc=>{
        var book = doc.data();
        if (book.bookAvailability){
          transactionType = 'Issue';
        }
        else{
          transactionType = 'Return';
        }
      })
    }
    return transactionType;
  }

  checkStudentEligibilityForBookIssue = async ()=>{
    const studentRef = await db.collection('students').where("studentId", "==", this.state.scannedStudentId)
    .get();
    var isStudentEligible = '';
    if (studentRef.docs.length === 0){
      isStudentEligible = false;
      alert('Student ID does not exist in the database');
      this.setState({scannedStudentId:'', scannedBookId: ''});
    }
    else{
      studentRef.docs.map(doc=>{
        var student = doc.data();
        if (student.numberOfBooksIssued < 2){
          isStudentEligible = true;
        }
        else {
          isStudentEligible = false;
          alert('The student has already issued a book.');
          this.setState({scannedStudentId:'', scannedBookId:''});
        }
      })
    }
    return isStudentEligible;
  }

  checkStudentEligibilityForBookReturn = async ()=>{
    const transactionRef = await db.collection('transactions').where("bookId", "==", this.state.scannedBookId)
    .limit(1).get();
    var isStudentEligible = '';
    transactionRef.docs.map(doc=>{
    var lastBookTransaction = doc.data();
    if (lastBookTransaction.studentId === this.state.scannedStudentId){
      isStudentEligible = true;
    }
    else {
      isStudentEligible = false;
      alert('The book was not issued by this student.');
      this.setState({scannedStudentId:'', scannedBookId:''});
    }
  })
    return isStudentEligible;
  }

  initiateBookIssue = async ()=>{
    db.collection('transactions').add({
      studentId:this.state.scannedStudentId,
      bookId:this.state.scannedBookId,
      date:firebase.firestore.Timestamp.now().toDate(),
      transactionType: "Issue"
    });
    db.collection('books').doc(this.state.scannedBookId).update({
      bookAvailability:false
    });
    db.collection('students').doc(this.state.scannedStudentId).update({
      numberOfBooksIssued:firebase.firestore.FieldValue.increment(1)
    });
    alert('Book Issued');
    //ToastAndroid.show('Book Issued', ToastAndroid.SHORT);
    //this.setState({scannedStudentId:'', scannedBookId:''});
  }


  initiateBookReturn = async ()=>{
    db.collection('transactions').add({
      studentId:this.state.scannedStudentId,
      bookId:this.state.scannedBookId,
      date:firebase.firestore.Timestamp.now().toDate(),
      transactionType: "Return"
    });
    db.collection('books').doc(this.state.scannedBookId).update({
      bookAvailability:true
    });
    db.collection('students').doc(this.state.scannedStudentId).update({
      numberOfBooksIssued:firebase.firestore.FieldValue.increment(-1)
    });
    alert('Book Returned');
    //ToastAndroid.show('Book Returned', ToastAndroid.SHORT);
    //this.setState({scannedStudentId:'', scannedBookId:''});
  }


  getCameraPermissions = async (Id)=>{
    const {status} = await Permissions.askAsync(Permissions.CAMERA);
    console.log({status});
    this.setState({
      hasCameraPermissions:status==="granted",
      scanned: false,
      buttonState: Id
    });
  }


  handleBarCodeScanned = async ({type, data})=>{
    const {buttonState} = this.state.buttonState;
    if(buttonState==="BookId"){
        this.setState({
            scanned: true,
            scannedBookId: data,
            buttonState: 'normal'
        });
      console.log(buttonState);
    }
    else if(buttonState==="StudentId"){
        this.setState({
            scanned: true,
            scannedStudentId: data,
            buttonState: 'normal'
        });
      console.log(buttonState);
    }
  }

  render(){
    const hasCameraPermissions = this.state.hasCameraPermissions;
    const scanned = this.state.scanned;
    const buttonState = this.state.buttonState;
    {console.log(buttonState)}
    {console.log(scanned)}
    {console.log(hasCameraPermissions)}
    if(buttonState!=='normal' && hasCameraPermissions){
      return(<BarCodeScanner
               style = {StyleSheet.absoluteFillObject}
               onBarCodeScanned={scanned?undefined:this.handleBarCodeScanned}
            />);
    }
    else if(buttonState==='normal'){
      return(
        <KeyboardAvoidingView
          style = {styles.container}
          behavior = {'padding'}
          enabled>
          <View>  
            <Image source={require("../assets/booklogo.jpg")}
              style = {{width:200, height:200}}/>
            <Text style={{textAlign:'center', fontSize:30}}>WiLi</Text>
          </View>

          <View style={styles.inputView}>
            <TextInput style = {styles.inputBox}
            placeholder = "Book ID"
            value = {this.state.scannedBookId}
            onChangeText = {(text)=>{
              this.setState({scannedBookId:text});
            }}/>
        
          <TouchableOpacity
            style = {styles.scanButton}
            onPress = {()=>{this.getCameraPermissions("BookId")}}>
            <Text style = {styles.buttonText}>Scan</Text>
          </TouchableOpacity>
          </View>

          <View style={styles.inputView}>
            <TextInput style = {styles.inputBox}
            placeholder = "Student ID"
            value = {this.state.scannedStudentId}
            onChangeText = {(text)=>{
              this.setState({scannedStudentId:text});
            }}/>
        
          <TouchableOpacity
            style = {styles.scanButton}
            onPress = {()=>{this.getCameraPermissions("StudentId")}}>
            <Text style = {styles.buttonText}>Scan</Text>
          </TouchableOpacity>
          </View>

        <TouchableOpacity 
          style = {styles.submitButton}
          onPress = {async()=>{
            var transactionMessage = await this.handleTransaction()
            this.setState({scannedStudentId:'', scannedBookId:''});;
          }}>
          <Text style = {styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
        </KeyboardAvoidingView>       
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  }, 
  displayText:{
    fontSize: 15,
    textDecorationLine: 'underline' 
  }, 
  scanButton:{
    backgroundColor: '#2196F3', 
    padding: 10, 
    margin: 10 
  }, 
  buttonText:{ 
    fontSize: 20, 
  },
  inputView:{
    flexDirection:'row',
    margin:20
  },
  inputBox:{
    width:200,
    height:40,
    borderWidth:1.5,
    borderRightWidth:0,
    fontSize:20
  },
  submitButton:{
    backgroundColor: '#FBC02D',
    width: 100,
    height: 50
  },
  submitButtonText:{
    padding: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    color:'white'
  }
});