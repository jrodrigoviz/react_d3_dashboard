import React, {useEffect,useState,Component} from 'react';
import {json} from 'd3-fetch';
import {sum} from 'd3-array';
import io from 'socket.io-client';
import BarChart from '../data_viz/BarChart';
import KPICard from '../data_viz/KPICard';
import RadarChart from '../data_viz/RadarChart';
import DataTable from '../data_viz/DataTable';
import {AppBar,Button,Grid,Card,CardMedia,CardContent, Drawer,TextField, List, ListItem, ListItemIcon,ListItemText, Typography} from '@material-ui/core'
import { set } from 'react-ga';

function makeID() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }

const Chooser = (props) =>{

    const [data,setData] = useState({roomID:-1,name:0,socket:0,isOpen:0, message:"",create:0});
    const [chatHistory,setHistory] = useState([]);
    const [roomData,setRoomData] = useState([]);

    const startSession = () => {

        if(data.isOpen == 0){
        const name = makeID();
        const roomID = makeID();
        const socket = io('http://localhost:3002/',{query:{roomID:roomID}});
        
        socket.on('connect',() => {
            socket.emit('room',{name:name,room:roomID,create:1},(d)=>setHistory((chatHistory) => [d, ...chatHistory]))
        });

        socket.on('server-message', (d) => {
            setHistory((chatHistory) => [d, ...chatHistory])
        })
    
        socket.on('server-room-data', (d) => {
            setRoomData((roomData) => [d, ...roomData])
        });

        setData({roomID:roomID,name:name, socket:socket,isOpen:1,message:data.message,dataInput:data.dataInput})
        }

        
    };

     const closeSession = () => {
        if( data.socket != 0 ){ data.socket.close()};
    
        setData({roomID:"Click to generate",name:0,socket:0,isOpen:0,message:data.message})
        setHistory([]);
    };

    const joinSession = () => {
        if(data.isOpen == 0){
        const name = makeID();
        const socket = io('http://localhost:3002/')
        
        socket.on('connect',() => socket.emit('room',{name:name,room:data.roomID,create:0}));

        socket.on('server-message', (d) => {
            setHistory((chatHistory) => [d, ...chatHistory]);
        })

        socket.on('server-room-data', (d) => {
            setRoomData((roomData) => [d, ...roomData])
        });

        setData({roomID:data.roomID,name:name,socket:socket,isOpen:1,message:data.message,dataInput:data.dataInput});
        }

    };

    const handleTextChange =  (d) =>{
        if (d.target.id == 'room-id-input'){
            setData({roomID:d.target.value,socket:data.socket,name:data.name,isOpen:data.isOpen,message:data.message,dataInput:data.dataInput})
        }else if (d.target.id == 'message-input'){
            setData({roomID:data.roomID,socket:data.socket,name:data.name,isOpen:data.isOpen,message:d.target.value,dataInput:data.dataInput})
        }else if (d.target.id == 'data-input'){
            setData({roomID:data.roomID,socket:data.socket,name:data.name,isOpen:data.isOpen,message:data.message,dataInput:d.target.value})
        }
    };

    const sendMessage =  () =>{

        data.socket.emit('message',{message: data.message,name:data.name});

    };

    const enterMessage =  (e) =>{

        if(e.keyCode == 13){

        data.socket.emit('message',{message: data.message,name:data.name});

        }
    };
    
    const enterData =  (e) =>{

        if(e.keyCode == 13){
        console.log(data.dataInput);

        data.socket.emit('data',{dataField:data.dataInput});

        }
    };    

    return (

      <div align="center" style = {{padding:'25px'}}>
        <Grid>
        <Grid container>
            <Typography> You are {(data.isOpen == 1 ? 'connected to : '+ data.roomID:'Not Connected')} </Typography>
        </Grid>
        <Grid container>
            
                <TextField value ={data.roomID} id='room-id-input' onChange={handleTextChange} ></TextField>
                <Button onClick = {startSession}>Create a Room</Button>
                <Button onClick = {joinSession}>Join</Button>
                <Button onClick = {closeSession}>Close</Button>
        </Grid>
        <Grid container>
            <TextField value ={data.message} id='message-input' onKeyDown={enterMessage} onChange={handleTextChange} ></TextField>
            <Button onClick = {sendMessage}>Send</Button>
        </Grid>
        <Grid container>
            <TextField value ={data.dataField} id='data-input' onKeyDown={enterData} onChange={handleTextChange} ></TextField>
            <Button >Send Data</Button>
        </Grid>
        <Grid container>
            <svg style = {{background:'#a7a7a7'}} width = {300} height = {300}>
            {
            roomData.filter((d,i) => i<=100).map((d,i) => (
                <circle r={5} fill={'#'+Math.floor(Math.random()*16777215).toString(16)} cx = {i*Math.random()*100} cy = {i*Math.random()*100}></circle>
            ))
            }   
            </svg>
        </Grid>

        <Grid container>
            <List >
            {
            chatHistory.filter((d,i)=> i<=10).map((d,i) => (
                <ListItem>{d}</ListItem>
            ))
            }   
            </List>
        </Grid>
        </Grid>
      </div>
    )
  }

export default Chooser
