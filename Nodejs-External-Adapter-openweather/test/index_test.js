const assert = require('chai').assert
const createRequest = require('../index.js').createRequest

describe('createRequest', () => {
  const jobID = '1'

  context('successful calls', () => {
    const requests = [
      { name: 'lat/lon with no id supplied', testData: { data: { lat: 50, lon: 50 } } },
      { name: 'lat/lon with id supplied', testData: { id: jobID, data: { lat: 50, lon: 50 } } },
      { name: 'lat/lon with id supplied but inputed as numbers in string format', testData: { id: jobID, data: { lat: "50", lon: "50" } } }
    ]

    requests.forEach(req => {
      it(`${req.name}`, (done) => {
        createRequest(req.testData, (statusCode, data) => {
          assert.equal(statusCode, 200)
          assert.equal(data.jobRunID, jobID)
          console.log(data.jobRunID)
          assert.isNotEmpty(data.data)
          console.log(Number(data.result), "aqi level")
          assert.equal(Number(data.result) > 0 && Number(data.result) < 6, true)
          assert.equal(Number(data.data.result) > 0 && Number(data.data.result) < 6, true)
          done()
        })
      })
    })
  })

  context('error calls', () => {
    const requests = [
      { name: 'empty body', testData: {} },
      { name: 'empty data', testData: { data: {} } },
      { name: 'lat not supplied', testData: { id: jobID, data: { lon: 50 } } },
      { name: 'lon not supplied', testData: { id: jobID, data: { lat: 50 } } },
      { name: 'input lat in not a number', testData: { id: jobID, data: { lat: 'some_string', lon: 50 } } },
      { name: 'input lon is not a number', testData: { id: jobID, data: { lat: 50, lon: "some_other_string" } } },
      { name: 'lat and lon are not numbers', testData: { id: jobID, data: { lat: "you_know_the_drill", lon: "you_know_the_drill" } } }
    ]

    requests.forEach(req => {
      it(`${req.name}`, (done) => {
        createRequest(req.testData, (statusCode, data) => {
          assert.equal(statusCode, 500)
          assert.equal(data.jobRunID, jobID)
          assert.equal(data.status, 'errored')
          assert.isNotEmpty(data.error)
          done()
        })
      })
    })
  })
})