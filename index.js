const express = require('express')
const app = express()
const PORT = process.env.PORT || 3001
const morgan = require('morgan')
const cors = require('cors')


app.use(express.json())
morgan.token('data', (request, response) => {return JSON.stringify(request.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.use(cors())
app.use(express.static('dist'))

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

const generateID = () => {
  let newID = null
  let IDExists = true
  const personIDs = persons.map(person => person.id)

  while (IDExists){
    newID = Math.floor(Math.random() * 10000) + 1
    IDExists = personIDs.find(id => id === newID)
  }
  return newID
}

function getTimezoneOffset() {
  function z(n){return (n<10? '0' : '') + n}
  var offset = new Date().getTimezoneOffset();
  var sign = offset < 0? '+' : '-';
  offset = Math.abs(offset);
  return sign + z(offset/60 | 0) + z(offset%60);
}


app.get('/', (request,response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request,response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  response.json(person)
})

app.delete('/api/persons/:id', (request,response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

app.post('/api/persons', (request,response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'Name Missing'
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'Number Missing'
    })
  }

  const nameExists = persons.find(person => person.name.toLowerCase() === body.name.toLowerCase())
  if (nameExists){
    return response.status(400).json({
      error: "Name is already being used"
    })
  }
  
  const person = {
    name: body.name,
    number: body.number,
    id: generateID() 
  }
  persons = persons.concat(person)
  response.json(person) 
})

app.get('/info', (request,response) => {
  const currentDate = new Date()
  const currentTime = currentDate.toLocaleString([], {hour12:false}).split(',')[1]
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const gmtOffset = getTimezoneOffset()
  response.send(`
    <div>Phonebook has info for ${persons.length} people</div>
    <br/>
    <div>${currentDate.toDateString()} ${currentTime} GMT ${gmtOffset} (${browserTimezone}) </div>
  `)
})


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
