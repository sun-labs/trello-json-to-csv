import React, { useState, useEffect } from 'react';
import styled from 'styled-components'

const AppWrapper = styled.div`
  height: 100vh;
  width: 100%;
`

const TextArea = styled.textarea`
  width: 100%;
  height: 75vh;
`

const Flex = styled.div`
  display: flex;
  flex-direction: ${props => props.col ? 'column' : 'row'};
  flex: ${props => props.n || 'initial'};
  padding: 1rem;
`

const Title = styled.p`
  font-weight: bold;
  text-align: center;
  margin: 0.5rem;
`

const SubTitle = styled.p`
  color: darkgray;
  margin-top: 0.5rem;
  text-align: center;
`

function App() {
  const [input, setInput] = useState()
  const [output, setOutput] = useState()
  const handleInput = (e) => {
    setInput(e.target.value);
  }
  const parseJSON = (str) => {
    try {
      return JSON.parse(str);
    } catch(e) {
      console.log(e)
      // set error or something
    }
  }
  const handleDownload = (e) => {
    e.preventDefault();
    const { URL, Blob } = window
    const data = new Blob([output])
    const a = document.createElement('a')
    a.href = URL.createObjectURL(data);
    a.style.display = 'none'
    a.download=`trello-csv-${new Date().toISOString()}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }
  useEffect(() => {
    if (input == null || input == false) return
    const timerId = setTimeout(() => {
      const json = parseJSON(input)
      const lists = json.lists.reduce((acc, list) => ({
        ...acc,
        [list.id]: list
      }), {})
      const allChecklists = json.checklists.reduce((acc, checkList) => ({
        ...acc,
        [checkList.id]: checkList
      }), {})
      const csvHeaders = ['name', 'description', 'listName', 'createdBy', 'checklists']
      const csvContent = json.cards.map((card) => {
        const { description, name, idList, idChecklists } = card
        const { name: listName } = lists[idList] || {}
        const checklists = idChecklists.map(
          (checklistId) => allChecklists[checklistId]
            .checkItems
            .map((item) => `${item.name}:${item.state}`)
            .join('-')
        ).join('--')
        return [name, description, listName, null, checklists ]
      })
      const csv = [
        csvHeaders.join(','),
        ...csvContent
      ]
      setOutput(csv.join('\n'));
    }, 500);
    return () => clearTimeout(timerId)
  }, [input, setOutput])
  return (
    <AppWrapper>
      <Flex>
        <Flex n="1" col>
          <Title>JSON</Title>
          <SubTitle>Input JSON from Trello export</SubTitle>
          <TextArea value={input} onChange={handleInput}></TextArea>
        </Flex>
        <Flex n="1" col>
          <Title>CSV</Title>
          <SubTitle>Output in CSV format <a onClick={handleDownload} href="#download">[Download]</a></SubTitle>
          <TextArea value={output} disabled></TextArea>
        </Flex>
      </Flex>
    </AppWrapper>
  )
}

export default App;
