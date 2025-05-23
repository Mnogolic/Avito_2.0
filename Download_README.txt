Разрешение для скриптов на текущую сессию:
    Set-ExecutionPolicy RemoteSigned -Scope Process

Путь:
	
	БД, перед запуском sql: 
		1. меняем окдировку - chcp 1251
		2. запускаем - psql -U postgres -h localhost
		3. Запуск (пароль 1032217607)

чтоб проверить базу данных:
	import psycopg2

# Параметры подключения к PostgreSQL
conn = psycopg2.connect(
    dbname="avito_db",      # имя твоей базы
    user="postgres",        # или твой пользователь
    password="1032217607",  # замени на свой пароль
    host="localhost",
    port="5432"
)

cursor = conn.cursor()

# Получаем список таблиц
cursor.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
""")
tables = cursor.fetchall()

print("📦 Таблицы в базе данных:")
for table in tables:
    table_name = table[0]
    print(f"\n🔸 Таблица: {table_name}")

    # Получаем список столбцов
    cursor.execute(f"""
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = '{table_name}'
    """)
    columns = cursor.fetchall()
    print("  📌 Столбцы:")
    for col in columns:
        print(f"    - {col[0]} ({col[1]})")

    # Считаем количество строк
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    count = cursor.fetchone()[0]
    print(f"  📊 Кол-во строк: {count}")

cursor.close()
conn.close()
