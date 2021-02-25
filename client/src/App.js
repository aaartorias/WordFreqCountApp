import './App.css';
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

const SERVER_ADDRESS = 'http://localhost';
const LISTENING_PORT = '9000';
const FILEUPLOAD_ADDRESS =  SERVER_ADDRESS + ':' + LISTENING_PORT + '/uploadFile';

class Display extends React.Component {

  render() {
    const wordCount = this.props.wordCount;
    var wordList = [];
    var countList = [];
    var x = wordCount.toString().replace('{','')
            .replace('}','')
            .replaceAll('"','')
            .split(',').map( (address, index) => {
              return <p key={index}>{ address }</p>; 
           });;

    var dict = [];

    x.forEach((item,index) => {
      let k = (item.props.children).toString().split(":")[0];
      let v = (item.props.children).toString().split(":")[1];
      dict.push({word:k,frequency:v})
    });

    return (
      <div  className="ag-theme-alpine" style={{ height: 500, width: 300 }}>
        {this.props.canCreateTable ? (
          <AgGridReact rowData={dict}>
            <AgGridColumn field="word" />
            <AgGridColumn field="frequency" />
          </AgGridReact>
        ) : (
    			<p></p>
    		)}
      </div>
    );
  }
}

class Form extends React.Component {
  
  state = {
    selectedFile: this.props.selectedFile,
    wordCount: this.props.wordCount, 
    isFileSelected: false, 
    warning:'',
  };

  resetOutputAndSelectFileActions = (event) => {
    this.setState({ selectedFile: event.target.files[0] });
    this.props.setFile(event.target.files[0]);
    this.setState({ isFileSelected: true });
    this.props.resetResultTitle();
    this.props.resetWordCount();
    this.clearWarning();
    this.props.resetCanCreateTable(); 
	};

  clearWarning = () => {
    this.setState({warning:''});
  }

  postAndSetAppState = () => {
    if (this.state.isFileSelected) {
      const formData = new FormData();
      formData.append('file', this.state.selectedFile);
      axios.post(FILEUPLOAD_ADDRESS, formData, {} )
        .then((response) =>{ 
          this.props.setCanCreateTable();
          this.props.setResult(response.data);
        })
        .catch((error) => {
          console.error('Error:', error);
      });
    } 
    else {
      this.setState({warning:'Warning: Please Select a file before uploading'});
    }
  };

  // When new input file is added, reset data received from previous file submission
  // Display File information
  // Handle file submission with postAndSetAppState
  render() {
    return (
      <div>
        <p>{this.state.warning}</p>
      <input type="file" name="file" onChange={this.resetOutputAndSelectFileActions} />
      {this.state.isFileSelected ? (
				<div>
					<p>Filename: {this.state.selectedFile.name}</p>
					<p>Filetype: {this.state.selectedFile.type}</p>
					<p>Size in bytes: {this.state.selectedFile.size}</p>
					<p>
						lastModifiedDate:{' '}
						{this.state.selectedFile.lastModifiedDate.toLocaleDateString()}
					</p>
				</div>
			) : (
				<p>Select a file to show details</p>
			)}
			<div>
				<button onClick={this.postAndSetAppState}>Submit</button>
			</div>  
      </div>
    );
  }
}

class App extends React.Component {
  state = {
    selectedFile: false,
    wordCount : [
     
    ],
    titleFreqeuncy:'',
    titleWord:'',
    canCreateTable:false,
  };
  

  setResultState = (props) => {
    var tmp = JSON.stringify(props);
    this.setState({wordCount:tmp});
    this.setState({titleWord:'Word'});
    this.setState({titleFrequency:'Frequency'});

  };

  setSelectedFile = (props) => {
    this.setState({selectedFile:true});
  };

  setCanCreateTable = () => {
    this.setState({canCreateTable:true});
  };

  resetCanCreateTable = () => {
    this.setState({canCreateTable:false});
  };

  resetResultTitle = () => {
    this.setState({titleWord:''});
    this.setState({titleFrequency:''});
  }

  resetWordCount = () => {
    this.setState({wordCount:''});
  }

  render() {
    return (
      <div>
        <div>
          {this.props.title}
        </div>
        <Form 
          setResult={this.setResultState} setFile={this.setSelectedFile} 
          resetWordCount={this.resetWordCount} resetResultTitle={this.resetResultTitle} 
          selectedFile={this.state.selectedFile} wordCount={this.state.wordCount}
          resetCanCreateTable={this.resetCanCreateTable} setCanCreateTable={this.setCanCreateTable}
        />
        <Display 
          wordCount={this.state.wordCount} titleFrequency={this.state.titleFrequency}
          titleWord={this.state.titleWord} isFileSelected={this.state.selectedFile} 
          canCreateTable={this.state.canCreateTable}
        />
      </div>
    );
  }	
}

ReactDOM.render(
  <App tilte="upload a text file to count the number of words"/>,
  document.getElementById('root')
);

export default App;