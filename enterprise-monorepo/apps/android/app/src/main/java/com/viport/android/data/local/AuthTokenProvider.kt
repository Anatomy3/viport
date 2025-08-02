package com.viport.android.data.local

import android.content.Context
import androidx.datastore.preferences.core.stringPreferencesKey
import com.viport.android.data.repository.dataStore
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthTokenProvider @Inject constructor(
    private val context: Context
) {
    private val dataStore = context.dataStore
    
    companion object {
        private val TOKEN_KEY = stringPreferencesKey("auth_token")
    }
    
    suspend fun getToken(): String? {
        return try {
            dataStore.data.first()[TOKEN_KEY]
        } catch (e: Exception) {
            null
        }
    }
}