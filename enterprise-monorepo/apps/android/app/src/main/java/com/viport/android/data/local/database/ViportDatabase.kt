package com.viport.android.data.local.database

import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import android.content.Context
import com.viport.android.data.local.converter.StringListConverter
import com.viport.android.data.local.dao.UserDao
import com.viport.android.data.local.entity.UserEntity

@Database(
    entities = [
        UserEntity::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(StringListConverter::class)
abstract class ViportDatabase : RoomDatabase() {
    
    abstract fun userDao(): UserDao
    
    companion object {
        const val DATABASE_NAME = "viport_database"
        
        @Volatile
        private var INSTANCE: ViportDatabase? = null
        
        fun getDatabase(context: Context): ViportDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    ViportDatabase::class.java,
                    DATABASE_NAME
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}