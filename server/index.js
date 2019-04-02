//---------------WEATHER--------------------------
const request = require('request')
const express = require('express')
const cors = require('cors')

const weatherAPI = (data) =>
  `https://api.darksky.net/forecast/31932079b2669596f3deed32e708d027/${data}?units=si&lang=ru`
const geolocationAPI = (data) =>
  `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    data,
  )}.json?access_token=pk.eyJ1Ijoia3JvbXNpayIsImEiOiJjanRpaTBxcDIwcHpjNDNwMjNoZ252d25xIn0.Gex1Ds440L_GPAWpO8tSkg&limit=1`

const geocode = (city, cb) => {
  return new Promise((resolve, reject) => {
    request.get(
      {
        json: true,
        url: geolocationAPI(city),
      },
      (err, resp) => {
        if (err) {
          reject(reportError('Не удалось получить геолокацию'))
        } else {
          const {
            body: {
              features: [matchCity],
            },
          } = resp
          if (!matchCity) {
            return reject(reportError('Не удалось получить геолокацию'))
          }
          const {
            center: [lng, lat],
            place_name,
          } = matchCity
          cb({ lat, lng, place_name })
            .then((data) => {
              resolve(data)
            })
            .catch((e) => reject(e))
        }
      },
    )
  })
}

const getWeather = (data) => {
  return new Promise((resolve, reject) => {
    const { lat, lng, place_name } = data
    const coords = `${lat},${lng}`
    request.get(
      {
        json: true,
        url: weatherAPI(coords),
      },
      (err, resp) => {
        if (err) {
          reject(reportError('Не удалось получить данные по погоде'))
        } else {
          if (resp.body.error) {
            reject(reportError('Не удалось получить данные по погоде'))
          } else {
            resolve(reportResult(resp.body, place_name))
          }
        }
      },
    )
  })
}

const reportResult = (data, place) => {
  const {
    currently: { temperature = '?', precipProbability = 0 },
    daily,
  } = data
  const report = daily.data[0].summary
  const msg = `${report}. Температура ${temperature}C. Вероятность дождя ${precipProbability}%`
  return { result: true, msg }
}

const reportError = (msg) => {
  return { error: true, msg }
}

const app = express()

// Automatically allow cross-origin requests
app.use(cors({ origin: true }))

app.get('/weather', (req, res) => {
  if (!req.query.address) {
    return res.send({ error: 'Это не город, или я его не понимаю - я же робот 👩‍🔬' })
  }

  geocode(req.query.address, getWeather)
    .then((data) => {
      if (data.result) {
        res.send({
          address: req.query.address,
          forecast: data.msg,
        })
      } else {
        res.send({
          address: req.query.address,
          forecast: data.msg,
        })
      }
    })
    .catch((e) => {
      res.send({
        address: req.query.address,
        forecast: e.msg,
      })
    })
})

app.listen(8888)
