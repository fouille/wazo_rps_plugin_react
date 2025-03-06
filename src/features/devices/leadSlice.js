import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { yealinkDelDevice } from './components/DelLeadFunction'
import { randomString } from '../../components/Functions/outils'

import axios from 'axios'

const yealinkGetToken = async () => {
    
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: '/v2/token',
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'nonce': `${randomString(32)}`, 
        'timestamp': `${Date.now()}`, 
        'Content-Type': 'application/json', 
        'Authorization': 'Basic ZDdiMmM0YmY5OTBmNGIzZGI3YjZkMjI4NzFkM2MzYTc6ZjJkNjg4NmJhMGFjNDI5MmFiNGFjM2MwZTgzNmQ2OWQ='
      },
      data : JSON.stringify({"grant_type": "client_credentials"}),
      mode: 'cors'
    };
  
    await axios.request(config)
    .then((response) => {
        
      localStorage.setItem('YealinkToken', response.data.access_token)
      return response.data
    })
    .catch((error) => {
      console.log(error);
    });
    // const Dispatch = useDispatch()
    
    // return response;
};

export const getLeadsContent = createAsyncThunk('/leads/content', async () => {
        const headers = { 
            'Access-Control-Allow-Origin': '*',
            'Nonce': randomString(32),
            'Timestamp': Date.now(),
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("YealinkToken")}`
            // 'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJwcm9qaWQiOiI0OTBiNTFkMzdkOGM0N2NjYjVkNmMyMWQ5YzZhYmQ3MyIsImNvdW50cnkiOiIiLCJwbmEiOiJWT0lQU0VSVklDRVMiLCJqdCI6ImFjY2Vzc190b2tlbiIsInBpZCI6IjIwMTEiLCJndCI6MCwidGlkIjoiZTM0ZWRkNWQ2MzQ2NGQ0YzljNmQyYjJlNzFhNjFiNDciLCJhY2lkIjoiZGI5MTY3YmQ2NGRmNGQ0YWI0MjlkODRkMDViZDk5MTEiLCJhdCI6MCwicyI6LTEsImFuYSI6IllJT1TkvIHkuJrlupTnlKhfMjAxMV8yMDExIiwiY3BjIjpbXSwiZXhwIjoxNzQxMjAyNzY2LCJzbyI6MiwicmVnaW9uIjoiZXUtY2VudHJhbC0xIiwiYWlkIjoiMTAxNWY1OWJiY2RlNDUzMDg4ODM2NTM3MzcyYjhhMDMiLCJqdGkiOiJhNGVjNWE4ZWYxOTQ0YTMzYjUxZTNhMzk3ZjQ4Nzg5OSIsImRpZCI6IjQwYTIyMDBjY2FlMzRlNWJiOGY2YWVhMmQwYTA2YzM2IiwiY2lkIjoiZDdiMmM0YmY5OTBmNGIzZGI3YjZkMjI4NzFkM2MzYTcifQ.kYGzO3K0EeFLLpyFjvLbXAmhtaHvJvJpBNMPWJUAWCYYbMipG3tJQ7ddcrEgJOzXvyNCcCf77wQewHDNS_W9ZBqVqiG6gbAgNjftyaex-yfuHr9iya4Jq8d2ycnjjS0D9eIysnCHlZ8UtfTLPOzyA4-pogs_4dQ0HGINVedFzzg`,
        }

        const response = await axios.post('/v2/rps/listDevices', 
            {
                "skip": 0,
                "limit": 20,
                "autoCount": true
            },
            {
                // Authorization: `Bearer ${localStorage.getItem("token")}`,
                headers: headers
            }
        )
        .then((response) => {
            // console.log(response.data)
            const serverFilter = 'http://franckprov.wazo.io:8667'
            const donnees = response.data.data
            const filteredData = donnees.filter(l => l.serverUrl === serverFilter || l.uniqueServerUrl === serverFilter)
            return filteredData
        })
        .catch(async (error) => {
            if (error.status === 401) {
                await yealinkGetToken()
                const dispatch = useDispatch()
                
                useEffect(() => {
                    dispatch(getLeadsContent())
                }, [])
            }  else {
                console.log(error)
            } 
        })
        return response
})

export const leadsSlice = createSlice({
    name: 'leads',
    initialState: {
        isLoading: false,
        leads : []
    },
    reducers: {


        addNewLead: (state, action) => {
            let {newLeadObj} = action.payload
            state.leads = [...state.leads, newLeadObj]
        },

        deleteLead: (state, action) => {
            let {index} = action.payload
            console.log(index);
            // const Arrayindex = Array.from(index)
            // prevoir ici la recupération d'un tableau pour devices multiples
            const ArrayForYealink = {"deviceIds": [index]}
            yealinkDelDevice(ArrayForYealink)
            state.leads.splice(index, 1)
        }
    },

    extraReducers: {
		[getLeadsContent.pending]: state => {
			state.isLoading = true
		},
		[getLeadsContent.fulfilled]: (state, action) => {
            // console.log(action);
            
            state.leads = action.payload
			state.isLoading = false
		},
		[getLeadsContent.rejected]: state => {
			state.isLoading = false
		},
    }
})

export const { addNewLead, deleteLead } = leadsSlice.actions

export default leadsSlice.reducer