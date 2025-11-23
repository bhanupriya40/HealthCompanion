const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));
require('dotenv').config();

const QUEUE_NAME = process.env.QUEUE_NAME ;
const UIPATH_URL = 'https://cloud.uipath.com/bhanuspace/DefaultTenant/orchestrator_/odata/Queues/UiPathODataSvc.AddQueueItem';
const UIPATH_TOKEN = process.env.UIPATH_TOKEN ;
const UIPATH_FOLDER_ID = process.env.UIPATH_FOLDER_ID ; 

app.post('/api/patient', async (req, res) => {
  const { name, age, symptoms, email } = req.body;

  if (!name || !age || !symptoms || !email) {
    return res.status(400).send({ error: 'Missing required fields' });
  }

  try {
    await axios.post(
      UIPATH_URL,
      {
        itemData: {
          Name: QUEUE_NAME,
          Priority: 'Normal',
          SpecificContent: {
            Name: name,
            Age: age,
            Symptoms: symptoms,
            Email: email
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${UIPATH_TOKEN}`,
          'X-UIPATH-OrganizationUnitId': UIPATH_FOLDER_ID,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Added to UiPath Queue: ${name} (${email})`);
    res.status(200).send({ success: true, message: 'Patient details submitted successfully!' });

  } catch (err) {
    console.error('❌ Error pushing to UiPath Queue:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error('Message:', err.message);
    }
    res.status(500).send({ error: 'Failed to push to UiPath Queue' });
  }
});

// === Start the server ===
app.listen(process.env.PORT || 3000, () => console.log('🚀 Health Companion Server running on http://localhost:3000'));
