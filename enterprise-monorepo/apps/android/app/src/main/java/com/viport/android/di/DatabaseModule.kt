package com.viport.android.di

import android.content.Context
import androidx.room.Room
import com.viport.android.data.local.dao.UserDao
import com.viport.android.data.local.database.ViportDatabase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    
    @Provides
    @Singleton
    fun provideViportDatabase(@ApplicationContext context: Context): ViportDatabase {
        return Room.databaseBuilder(
            context.applicationContext,
            ViportDatabase::class.java,
            ViportDatabase.DATABASE_NAME
        )
            .fallbackToDestructiveMigration()
            .build()
    }
    
    @Provides
    fun provideUserDao(database: ViportDatabase): UserDao {
        return database.userDao()
    }
}