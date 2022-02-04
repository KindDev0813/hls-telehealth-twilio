# Telehealth EHR Integration Guide & Specification

For embedding Telehealth application into your patient/provider portal
, please refer to [Telehealth Portal Integration Guide](PORTAL_INTEGRATION.md).

Telehealth application is designed to operate directly integrated with your EHR access the following resources:

| Resources | Retrieve | Create |
|-----------|----------|--------|
|Appointment for telehealth visits| :heavy_check_mark:| :heavy_check_mark: |
|Patient and patient's problem list (conditions) and medications| :heavy_check_mark:| :heavy_check_mark: |
|Provider and on-call assignment to see on-demand telehealth visit patients| :heavy_check_mark:| |
|Patient insurance eligibility validation and copay information| :heavy_check_mark:| |
|Waiting room contents| :heavy_check_mark:| :heavy_check_mark: |

Telehealth application ships with simulated EHR integration using sample EHR resources
stored using [Twilio Sync](https://www.twilio.com/sync) Document Resources.
These EHR resources are based on the [FHIR](http://hl7.org/fhir/) standard
and define the minimum set of data elemented required for proper operation of the Telehealth application.



While your EHR integration will be specific to your available integration methods
that range from HL7 v2 message, to EHR Native API, to FHIR APIs.






Therefore, we recommend integrating with your [FHIR](http://hl7.org/fhir/) server endpoint of your EHR implementation
that should be available as part of continuing interoperability initiatives
from [CMS](https://www.cms.gov/Regulations-and-Guidance/Guidance/Interoperability/index)
and [HHS ONC for HIT](https://www.healthit.gov/isa/united-states-core-data-interoperability-uscdi).

[content json schema](assets/datastore/content.schema.json)

Additional custom EHR integrations will be needed to support on-demand telhealth appointments:

- Patient insurance eligibility
- Patient online payment processing
- Uploading of new patient information to EHR

Data specifications are defined as a subset of [HL7 FHIR Specification](http://hl7.org/fhir/).


## Provider

### Provider Information: [Practitioner](https://www.hl7.org/fhir/practitioner.html)

Search of providers who service telehealth appointments.

<details><summary>Open JSON template</summary>

#### Request
```http request
http://your-fhir-endpoint/fhir/Practitioner?parameter=value
```

#### Response
```json
{
  "resourceType": "Bundle",
  "meta": {
    "lastUpdated": "2014-08-18T01:43:30Z"
  },
  "type": "searchset",                                // fixed to 'searchset'
  "total": <NumberofPractitioners>,
  "entry": [
    {
      "resourceType": "Practitioner",
      "id": "<ProviderID>",                           // unique patient ID
      "name": [
        {
          "use": "official",
          "text": "<ProviderFullName>",
          "family": "<ProviderLastName>",
          "given": ["<ProviderFirstName>"]            // used as SMS salutation 
        }
      ],
      "telecom": [
        {
          "system": "sms",
          "value": "<ProviderMobilePhone>",           // E.164 format is preferred
          "use": "mobile"
        }
      ]
    }
  ]
}
```
- `.type` value from [Bundle Type](http://hl7.org/fhir/ValueSet/bundle-type)
- `.entry[].telecom[].value` format should be [E.164 format](https://www.twilio.com/docs/glossary/what-e164)

</details>

### Provider for On-Demand Appointments: : [PractitionerRole](https://www.hl7.org/fhir/practitionerrole.html)

Search of providers who is on-call for on-demand appointments.
There can be only ONE provider on-call.

<details><summary>Open JSON template</summary>

#### Request
```http request
http://your-fhir-endpoint/fhir/PractitionerRole?parameter=value
```

#### Response

```json
{
  "resourceType": "Bundle",
  "meta": {
    "lastUpdated": "2014-08-18T01:43:30Z"
  },
  "type": "searchset",                                // fixed to 'searchset'
  "total": 1,                                         // fixed to 1
  "entry": [
    {
      "resourceType": "PractitionerRole",
      "id": "example",
      "active": true,
      "practitioner": {
        "reference": "Practitioner/<PractitionerID>"
      },
      "code": [
        {
          "text": "on-call-for-on-demand-appointment"
        }
      ]
    }
  ]
}
```
- `.type` value from [Bundle Type](http://hl7.org/fhir/ValueSet/bundle-type)
- `entry[].code[].text` is a custom value specific for telehealth

</details>



## Patient Resources

### Patient Demographic: [Patient](https://www.hl7.org/fhir/patient.html)

Search of patients who consented to telehealth visits.

<details><summary>Open JSON template</summary>

#### Request
```http request
http://your-fhir-endpoint/fhir/Patient?parameter=value
```

#### Response
```json
{
  "resourceType": "Bundle",
  "type": "searchset",                       // fixed to 'searchset'
  "total": <NumberofPatients>,
  "entry": [
    {
      "resourceType": "Patient",
      "id": "<PatientID>",                   // unique patient ID
      "meta": {
        "source": "<http://twilio.com | customer's FHIR endpoint url>"
      },
      "name": [{
        "use": "official",
        "text": "<PatientFullName>",
        "family": "<PatientLastName>", 
        "given": [ "<PatientFirstName>" ]    // used as SMS salutation 
      }],
      "telecom": [
        {
          "system": "sms",
          "value": "<PatientMobilePhone>",   // E.164 format is preferred
          "use": "mobile"
        },
        {
          "system": "email",
          "value": "<PatientEmailAddress>",  // E.164 format is preferred
          "use": "home"
        }
      ],
      "gender": "<PatientGender>",           // code value from AdministrativeGender code system 
      "communication": [{                    // optional, present ONLY if translator is needed
        "language": {
          "coding": [{
            "system": "urn:ietf:bcp:47",
            "code": "<PatientLanguageCode>", // code value from Languages value set
            "display": "<PatientLanguage>"   // display value from Language value set
          }]
        },
        "preferred": true
      }]
    }
  ]
}
```
- `.type` value from [Bundle Type](http://hl7.org/fhir/ValueSet/bundle-type)
- `.entry[].telecom[].value` format should be [E.164 format](https://www.twilio.com/docs/glossary/what-e164)
- `.entry[].gender` value from [AdministrativeGender](http://hl7.org/fhir/administrative-gender)
- `.entry[].communication[].language[].coding` value from [Language](http://hl7.org/fhir/ValueSet/languages).
`code` is made up of [ISO-639-1 alpha 2 code](https://www.loc.gov/standards/iso639-2/php/code_list.php) in lower case for the language,
optionally followed by a hyphen and the [ISO-3166-1 alpha 2 code](https://www.iso.org/obp/ui/#search/code/) for the region in upper case.

</details>

### Medication Statement: : [MedicationStatement](https://www.hl7.org/fhir/medicationstatement.html)

Search of `status = active` and limited to telehealth patients.

<details><summary>Open JSON template</summary>

#### Request
```http request
http://your-fhir-endpoint/fhir/MedicationStatement?parameter=value
```

#### Response


```json
{
  "resourceType": "Bundle",
  "type": "searchset",                                // fixed to 'searchset'
  "total": <NumberofMedicationStatements>,
  "entry": [
    {
      "resourceType": "MedicationStatement",
      "medicationCodeableConcept": {
        "text": "<PatientMedication>"
      },
      "status": "active",
      "subject": {
        "reference": "Patient/<PatientID>"
      }
    }
  ]
}
```
- `.type` value from [Bundle Type](http://hl7.org/fhir/ValueSet/bundle-type)
- `.entry[].status` value from [Medication Statement Status](http://hl7.org/fhir/ValueSet/medication-statement-status)
- `.entry[].medication` value only needs the display name of the medication
from [National Drug Code](https://www.fda.gov/drugs/drug-approvals-and-databases/national-drug-code-directory)
, [RXNORM](https://www.nlm.nih.gov/research/umls/rxnorm/index.html)
, [SNOWMED](https://www.snomed.org/)
, etc.

</details>


### Pre-existing Condition/Problem: [Condition](https://www.hl7.org/fhir/condition.html)

Search of `clinicalStatus = active|recurrence|relapse` and
limited to telehealth patients.

<details><summary>Open JSON template</summary>

#### Request
```http request
http://your-fhir-endpoint/fhir/Practitioner?parameter=value
```

#### Response


```json
{
  "resourceType": "Bundle",
  "type": "searchset",                                // fixed to 'searchset'
  "total": <NumberofConditions>,
  "entry": [
    {
      "resourceType": "Condition",
      "clinicalStatus": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
            "code": "active"
          }
        ]
      },
      "category": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/condition-category",
            "code": "problem-list-item"               // fixed to 'problem-list-item'
          }
        ]
      },
      "code": {
        "text": "<PatientPreexistingConditionDescription>"
      },
      "subject": {
        "reference": "Patient/<PatientID>"
      }
    }
  ]
}
```
- `.type` value from [Bundle Type](http://hl7.org/fhir/ValueSet/bundle-type)
- `.entry[].clinicalStatus.coding[].code` value from [Condition Clinical Status Codes](http://terminology.hl7.org/CodeSystem/condition-clinical)
- `.entry[].category.code[].code` value from [Condition Category Codes](http://terminology.hl7.org/CodeSystem/condition-category)

</details>


### Appointment: [Appointment](https://www.hl7.org/fhir/appointment.html)

Search of telehealth pre-scheduled appointments for today (`appointmentDate = today`).

<details><summary>Open JSON template</summary>

#### Request
```http request
http://your-fhir-endpoint/fhir/Practitioner?parameter=value
```

#### Response


```json
{
  "resourceType": "Bundle",
  "meta": {
    "lastUpdated": "2014-08-18T01:43:30Z"
  },
  "type": "searchset",                                // fixed to 'searchset'
  "total": <NumberofAppointments>,
  "entry": [
    {
      "resourceType": "Appointment",
      "id": "<AppointmentID>",
      "status": "booked if from customer EHR | arrived if from Teleheath",
      "appointmentType": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v2-0276",
            "code": "<AppointmentType>"     // WALKIN used for on-demand telehealth
          }
        ]
      },
      "reasonCode": [
        {
          "text": "<AppointmentReason>"
        }
      ],
      "start": "2013-12-10T09:00:00Z",
      "end": "2013-12-10T11:00:00Z",
      "participant": [
        {
          "actor": {
            "reference": "Patient/<PatientID>"
          }
        },
        {
          "type": [
            {
              "coding": [
                {
                  "system": "http://hl7.org/fhir/ValueSet/encounter-participant-type",
                  "code": "ATND"
                }
              ]
            }
          ],
          "actor": {
            "reference": "Practitioner/<PractitionerID>"
          }
        }
      ]
    }
  ]
}
```
- `.type` value from [Bundle Type](http://hl7.org/fhir/ValueSet/bundle-type)
- `.entry[].clinicalStatus.coding[].code` value from [Condition Clinical Status Codes](http://terminology.hl7.org/CodeSystem/condition-clinical)
- `.entry[].appointmentType` value from [Appointment Reason Code](http://terminology.hl7.org/CodeSystem/v2-0276)
- `.entry[].reasonCode.text` value for scheduled appointments from [Encounter Reason Code](http://hl7.org/fhir/ValueSet/encounter-reason)
- `.entry[].participant[].type[].coding` values from [Encounter Participant Type](http://hl7.org/fhir/ValueSet/encounter-participant-type)

</details>


### Waiting Room Content: [DocumentReference](https://www.hl7.org/fhir/documentreference)

Search of waiting room content for telehealth

<details><summary>Open JSON template</summary>

#### Request
```http request
http://your-fhir-endpoint/fhir/DocumentReference?parameter=value
```

#### Response


```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": <NumberofContents>,                             // required for checksum
  "entry": [
    {
      "resourceType": "DocumentReference",
      "id": "<ContentID>",                                 // required (1..1)
      "meta": {
        "source": "<http://twilio.com | customer's FHIR endpoint url>"
      },
      "status": "current",
      "description": "<ContentLongDescription>",           // optional (0..1), for tooltip
      "content": [
        {
          "attachment": {
            "url": "<ContentVideoURL>",                    // required (1..1)
            "title": "<ContentShortTitle>"                 // required (1..1)
          }
        }
      ],
      "context": {
        "related": [
          {
            "reference": "<ContentAssignedPractitionerID>" // optional (0..*)
          }
        ]
      }
    }
  ]
}
```
- `.type` value from [Bundle Type](http://hl7.org/fhir/ValueSet/bundle-type)
- `.entry[].status` value from [Document Reference Status](http://hl7.org/fhir/ValueSet/document-reference-status)

</details>


