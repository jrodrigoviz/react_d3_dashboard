import React, {useEffect,useState,Component} from 'react';
import io from 'socket.io-client';
import BubbleChart from '../data_viz/BubbleChart';
import BarChart from '../data_viz/BarChart';
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
    const [initialNodes,setInitialNodes] = useState([]);
    const [barChartData,setBarChartData] = useState([]);

    const startSession = () => {

        if(data.isOpen == 0){
        const name = makeID();
        const roomID = makeID();
        const socket = io('http://localhost:3002/',{query:{roomID:roomID}});
        
        socket.on('connect',() => {
            socket.emit('room',{name:name,room:roomID,create:1},(d)=>{
                setHistory((chatHistory) => [d.room, ...chatHistory]);
                setInitialNodes(d.initialNodes);    
            })
        });

        socket.on('disconnect', () => {
            socket.emit('room-disconnect',{name:name,room:roomID},()=>console.log("disconnected"))
        });

        socket.on('server-message', (d) => {
            setHistory((chatHistory) => [d, ...chatHistory])
        })
    
        socket.on('server-room-data', (d) => {
            setRoomData((roomData) => d)
        });

        setData({roomID:roomID,name:name, socket:socket,isOpen:1,message:data.message,dataInput:data.dataInput})
        }

        
    };

     const closeSession = () => {
        if( data.socket != 0 ){ 
            data.socket.emit('room-disconnect',{name:data.name,room:data.room},()=>{
                console.log("disconnected");
                data.socket.close()
            })
        };
    
        setData({roomID:"Click to generate",name:0,socket:0,isOpen:0,message:data.message})
        setHistory([]);
        setRoomData([]);
        setBarChartData([]);
    };

    const joinSession = () => {
        if(data.isOpen == 0){
        const name = makeID();
        const socket = io('http://localhost:3002/')
        
        socket.on('connect',() => socket.emit('room',{name:name,room:data.roomID,create:0},
            (d) => setRoomData(d))
        );

        socket.on('disconnect', ()=>socket.emit('room-disconnect',{name:name,room:data.roomID}));


        socket.on('server-message', (d) => {
            setHistory((chatHistory) => [d, ...chatHistory]);
        })

        socket.on('server-room-data', (d) => {
            console.log("server sent data");
            setRoomData((roomData) => d)
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

        data.socket.emit('data',{dataField:data.dataInput});

    };    

    const retrieveBubbleChartData = (d) => {

        const arr = [];
        const arrEqual = true;
        
        const keysArr = Object.keys(d);

        keysArr.sort().forEach((e,i)=>{
            const val = d[e];
            const series = e;
            const key = i;
            const element = {key:i,series:e,value:val};
            arr.push(element)
        })

        setBarChartData(arr)
        
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
        {data.isOpen == 1 ? (
        <Grid container>
        <Grid container>
            <TextField value ={data.message} id='message-input' onKeyDown={enterMessage} onChange={handleTextChange} ></TextField>
            <Button onClick = {sendMessage}>Send</Button>
        </Grid>

        <Grid container>
            <TextField value ={data.dataField} id='data-input' onKeyDown={enterData} onChange={handleTextChange} ></TextField>
            <Button onClick={enterData}>Send Data</Button>
        </Grid>
        </Grid>
        ):(null)
        } 
        <Grid container>
            <BubbleChart callbackData = {retrieveBubbleChartData} size={[500,500]} bg="#f7f7f7" data={roomData} initialNodes ={initialNodes}/>
        </Grid>
        <Grid container>
            <BarChart size={[500,200]} bg="#f7f7f7" padding={50} speed={500} xAdjust ={0} data={barChartData} xAdjust={0} keysort={0} dataMax={100} orientation="vertical" />
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
