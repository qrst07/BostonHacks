import React, { useState } from "react";
import {Button, Modal} from '@material-ui/core/';
import {Link} from "react-router-dom";
import './App.css';
import containerprompt from './imgs/containerprompt.png'

function Home(props) {
  //closed by default
  const [uploadModal, setUploadModal] = useState(false);
  const [manualModal, setManualModal] = useState(false);
  const [questionModal, setQuestionModal] = useState(false);
  const [detectedObject, setDetectedObject] = useState();

  const handleUploadModal = () => {
    setUploadModal(true);
  }

  const handleManualModal = () => {
    setManualModal(true);
  }

  const handleCloseParent = () => {
    setManualModal(false);
    setUploadModal(false);
  }

  const handleCloseChild = () => {
    setQuestionModal(false);
  }

  let handleCallback = (data) => {
    //set object here too - this could be used for the image and manual modals
    //data is what the child sent - now u can use that in the q&a modal
    setDetectedObject(data);
    // open the q&a modal, close parents
    handleCloseParent();
    setQuestionModal(true);
	} 

  return(
    <div>
      <Link to="/">
        <Button variant="contained">Logout</Button>
      </Link>
      Home
      <Button variant="contained" onClick={handleUploadModal}>Upload pic</Button>
      <Button variant="contained" onClick={handleManualModal}>Manual</Button>
      <Modal
        open={uploadModal}
        onClose={handleCloseParent}
      >
        <div className="testModal">
          <ImageModalParent parentCallback={handleCallback} />
        </div>
      </Modal>
      <Modal
        open={manualModal}
        onClose={handleCloseParent}
      >
        <div className="testModal">
          <ManualModalParent parentCallback={handleCallback}/>
        </div>
      </Modal>
      <Modal
        open={questionModal}
        onClose={handleCloseChild}
      >
        <div className="testModal">
          <QuestionModal detectedObject={detectedObject} parentCallback={handleCloseChild}/>
        </div>
      </Modal>
    </div>
  )
}

function ImageModalParent(props) {
  let {parentCallback} = props;
  const [detectedObject, setDetectedObject] = useState();
  
  let handleSubmit = () => {
    //this happens on success - send the detectedObject to the parent
    parentCallback(detectedObject);
  }

  let handleUpload = () => {
    // upload the image to the google thing, get the result
    //set the detected object below to the state
    setDetectedObject('box');
  }
  if (detectedObject) {
    return (
      <div className = "submittedPrompt">
        Is {detectedObject} the item you submitted?
        <div className = "containerButtonsStacked">
        <Button className = "yesContainerStacked" variant="contained" onClick={handleSubmit}>Yes</Button>
        <Button className = "noContainerStacked" variant="contained" onClick={() => setDetectedObject(null)}>No</Button>
        </div>
      </div>
    )
  }
  // default - no object detected yet
  return (
    <div>
      Upload picture (google cloud)
      {/* image uploading would be here */}
      <Button variant="contained" onClick={handleUpload}>Upload</Button>
    </div>
  )
}

function ManualModalParent(props) {
  let {parentCallback} = props;
  const [detectedObject, setDetectedObject] = useState();
    
  let handleSubmit = () => {
    //this happens on success - send the detectedObject to the parent
    parentCallback(detectedObject);
  }

  return (
    <div>
      What is your item?
      <form>
        <p><Button variant="contained" onClick={() => {setDetectedObject("Bottle")}}>Jugs or Bottles</Button></p>     
        <p><Button variant="contained" onClick={() => {setDetectedObject("Containers")}}>Containers</Button></p>
        <p><Button variant="contained" onClick={() => {setDetectedObject("Textiles")}}>Textiles</Button></p>
        <p><Button variant="contained" onClick={() => {setDetectedObject("Electronics")}}>Electronics</Button></p>
      <label>
          Other: 
            <input type = "text" name="other" />
      </label>
        <Button variant="contained" onClick={handleSubmit}>Submit</Button>
      </form>
    </div>
  )
}

// the styling for questions can go here for now?
function QuestionModal(props) {
  let {detectedObject, parentCallback} = props;
  let [materialModal, setMaterialModal] = useState(false);
  let [result, setResult] = useState(null); // "r" or "w"
  let [nextStep, setNextStep] = useState(); // 'follow up', 'next', or 'material'

  // button to go to next step
  let finishButton = (
    <Button variant="contained" onClick={() => setMaterialModal(true)}>Finish</Button>
  )

  // assuming these are the only options we will handle:
  // container, jug, bottle, electronic, propane tanks, textiles
  // other will get handled differently
  let containerContent = [
    "",
    "Please dry the container"
  ];

  let jugContent = [
    "Is there a straw or lid?",
    "Please separate the straw and lid and send them to waste",
    "Is it less than 5 liters?"
  ]

  //default
  let content = (<div>Next results</div>)

  while(result === null) {
    // Qs for Item types (Step 1)
    if (detectedObject === 'box' || detectedObject === 'containers') {
      content = (
        <div>
          {containerContent[0]}
          <Button variant="contained" onClick={() => setNextStep('material')}>Yes</Button>
          <Button variant="contained" onClick={() => setNextStep('follow up')}>No</Button>
        </div>
      )
      if (nextStep === 'follow up') {
        content = (
          <div>
            {containerContent[1]}
            <Button variant="contained" onClick={() => setNextStep('material')}>All Done!</Button>
          </div>
        )
      }
    }
    else if (detectedObject === 'jugs' || detectedObject === 'bottles') {
      content = (
        <div>
          {jugContent[0]}
          <Button variant="contained" onClick={() => setNextStep('follow up')}>Yes</Button>
          <Button variant="contained" onClick={() => setNextStep('next')}>No</Button>
        </div>
      ) 
      if (nextStep === 'follow up') {
          content = (
            <div>
              {jugContent[1]}
              <Button variant="contained" onClick={() => setNextStep('next')}>All Done!</Button>
            </div>
          )
      } if (nextStep === 'next') {
          content = (
            <div>
              {jugContent[2]}
              <Button variant="contained" onClick={() => setNextStep('material')}>Yes</Button>
              <Button variant="contained" onClick={() => setResult('w')}>No</Button>
            </div>
          )
        }
    }
    else if (detectedObject === 'electronics' || detectedObject === 'propane tanks') {
      content = (
        <div>
          Look for the closest disposal center near you! (google maps?)
        </div>
      )
    }
    else {
      setNextStep('material');
    }

    //Material Qs
    if (nextStep === 'material') {
      content = (
        <div>
          What material is your item made of?
          <Button variant="contained" onClick={() => setNextStep('glass')}>Glass</Button>
          <Button variant="contained" onClick={() => setNextStep('plastic')}>Plastic</Button>
          <Button variant="contained" onClick={() => setResult('r')}>Metal</Button>
          <Button variant="contained" onClick={() => setNextStep('paper')}>Paper</Button>
          <Button variant="contained" onClick={() => setResult('w')}>Styrofoam</Button>
        </div>
      ) 
      if (nextStep === 'glass') {
        content = (
          <div>
            Is it broken?
            <Button variant="contained" onClick={() => setResult('w')}>Yes</Button>
            <Button variant="contained" onClick={() => setResult('r')}>No</Button>
          </div>
        )
      } else if (nextStep === 'plastic') {
        content = (
          <div>
            Please Enter the SPI Number. (form)
          </div>
        )
      } else if (nextStep === 'paper') {
        content = (
          <div>
            Is there a wax or plastic coating?
            <Button variant="contained" onClick={() => setResult('w')}>Yes</Button>
            <Button variant="contained" onClick={() => setResult('r')}>No</Button>
          </div>
        )
      }
    }
  }

  return (
    <div >
      {content}
      <Modal 
        open={materialModal}
        onClose={parentCallback}
      >
        <div className="testModal">
          <MaterialModal detectedObject={detectedObject}/>
        </div>
      </Modal>
    </div>
  )
}

// The API calls can go here for now? We can rearrange stuff later
function MaterialModal(props) {
  let {detectedObject} = props;

  return (
    <div>
      something
    </div>
  )
}


export default Home;
