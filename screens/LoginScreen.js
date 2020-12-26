import React, {Component} from 'react';
import {Image, StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView} from 'react-native';
import db from '../Config';
import * as firebase from 'firebase';

export default class LoginScreen extends Component{
  constructor(){
    super();
    this.state = {
      emailId: '',
      password: ''
    }
  }

  login = async (emailId, password)=>{
    console.log('Inside login function');
    if (emailId && password){
      try {
        const response = await firebase.auth().signInWithEmailAndPassword(emailId, password);
        console.log(response);
        if (response){
          this.props.navigation.navigate('BookTransaction')
        }
      }
      catch (error) {
        switch (error.code){
          case 'auth/user-not-found':
            alert('User does not exist.')
            break;

          case 'auth/invalid-email':
            alert('Incorrect email or password')
            break;
        
          default:
            break;
        }
      }
    }
    else{
      alert('Please enter Email and Password.')
    }
  }

  render(){
    return(
      <KeyboardAvoidingView style = {{alignItems:'center', marginTop: 20}}>
        <View>
          <Image source={require('../assets/booklogo.jpg')}
            style = {{width:200, height:200}}/>
          <Text style = {{textAlign:'center', fontSize:30}}>WiLi</Text>
        </View>
        <View>
          <TextInput
            style = {styles.loginBox}
            placeholder = 'abc123@example.com'
            keyboardType = 'email-address'
            onChangeText = {text =>{this.setState({emailId:text})}}
          />
          <TextInput
            style = {styles.loginBox}
            placeholder = 'Enter password'
            secureTextEntry = {true}
            onChangeText = {text =>{this.setState({password:text})}}
          />
        </View>
        <View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={()=>{this.login(this.state.emailId, this.state.password)}}>
            <Text style = {{textAlign:'center'}}>Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  loginBox: {
    width: 300,
    height: 40,
    borderWidth: 1.5,
    fontSize: 20,
    margin:10,
    paddingLeft:10
  },
  submitButton: {
    height:30,
    width:90,
    borderWidth:1,
    marginTop:20,
    paddingTop:5,
    borderRadius:7
  }
});