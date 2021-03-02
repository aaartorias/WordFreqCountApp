import './App.css';
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const SERVER_ADDRESS = 'http://localhost';
const LISTENING_PORT = '9000';
const UPLOAD_API = '/uploadFile';
const FILEUPLOAD_ADDRESS =  SERVER_ADDRESS + ':' + LISTENING_PORT + UPLOAD_API;

class Display extends React.Component {

  render() {
    const wordCount = this.props.wordCount;
    var dict = [];
    var x = wordCount.toString().replace('{','')
            .replace('}','')
            .replaceAll('"','')
            .split(',').map( (address, index) => {
              return <p key={index}>{ address }</p>; 
           });;

    x.forEach((item,index) => {
      let k = (item.props.children).toString().split(':')[0];
      let v = (item.props.children).toString().split(':')[1];
      dict.push({word:k,frequency:v})
    });

    return (
      <div  className='ag-theme-alpine' style={{ height: 500, width: 300 }}>
        {this.props.canCreateTable ? (
          <AgGridReact rowData={dict}>
            <AgGridColumn field='word' />
            <AgGridColumn field='frequency' />
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
    selectedFile: '',
    isFileSelected: false, 
    warning:'',
  };

  handleInputSelection = (event) => {

    // Clear warnings
    if (this.state.warnings != '') {
      this.clearWarning();
    }

    // SelectedFile:   file selected in input field otherwise ''
    // isFileSelected: true if a file is selected otherwise false
    if (event.target.files[0] == undefined) {
      this.setState({ selectedFile: '' });
      this.setState({ isFileSelected: false });
    } else {
      this.setState({ isFileSelected: true });
      this.setState({ selectedFile: event.target.files[0] });
    }

    // Reset wordCount - used to contain wordCountResult 
    this.props.setWordCount('');
    //  reset CanCreateTable - flag that signals to stop displaying result table
    this.props.setCanCreateTable(false); 

	};

  clearWarning = () => {
    this.setState({warning:''});
  }

  handleFormSubmission = () => {

    if (this.state.isFileSelected) {
      const formData = new FormData();
      formData.append('file', this.state.selectedFile);

      axios.post(FILEUPLOAD_ADDRESS, formData, {} )
      .then((response) =>{ 
          this.props.setCanCreateTable(true);
          this.props.setWordCount(response.data);
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
  // call handleFormSubmission to process the submission of file.
  render() {
    return (
      <div>
        <p>{this.state.warning}</p>
      <input type="file" name="file" onChange={this.handleInputSelection} />
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
				<button onClick={this.handleFormSubmission}>Submit</button>
			</div>  
      </div>
    );
  }
}

class App extends React.Component {

  state = {
    wordCount : [],
    titleFreqeuncy:'',
    titleWord:'',
    canCreateTable:false,
  };

  // Setter
  setWordCount = (props) => {
    var tmp = JSON.stringify(props);
    this.setState({wordCount:tmp});
  };

  setCanCreateTable = (props) => {
    this.setState({canCreateTable:props});
  };

  render() {
    return (
      <div>
        <div>
          {this.props.title}
        </div>
        <Form 
          setWordCount={this.setWordCount}
          setCanCreateTable={this.setCanCreateTable}
        />
        <Display 
          wordCount={this.state.wordCount} 
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