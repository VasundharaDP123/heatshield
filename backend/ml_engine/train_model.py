import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import pickle
import numpy as np

def generate_synthetic_data(n_samples=1000):
    np.random.seed(42)
    # Generate realistic ranges
    age = np.random.randint(18, 70, n_samples)
    outdoor_job = np.random.randint(0, 2, n_samples)
    bp_patient = np.random.randint(0, 2, n_samples)
    temperature = np.random.uniform(25, 50, n_samples)
    aqi = np.random.uniform(50, 500, n_samples)
    
    data = pd.DataFrame({
        'age': age,
        'outdoor_job': outdoor_job,
        'bp_patient': bp_patient,
        'temperature': temperature,
        'aqi': aqi
    })
    
    # Calculate risk score based on synthetic rules
    def calculate_risk(row):
        score = 0
        
        # Temp risk
        if row['temperature'] > 45:
            score += 3
        elif row['temperature'] > 40:
            score += 2
        elif row['temperature'] > 35:
            score += 1
            
        # AQI risk
        if row['aqi'] > 300:
            score += 2
        elif row['aqi'] > 150:
            score += 1
            
        # Job risk
        if row['outdoor_job'] == 1 and row['temperature'] > 35:
            score += 2
            
        # Health risk
        if row['bp_patient'] == 1 and (row['temperature'] > 35 or row['aqi'] > 150):
            score += 2
            
        # Age risk
        if row['age'] > 55 and row['temperature'] > 38:
            score += 1
            
        # Classify
        if score >= 6:
            return 3 # CRITICAL
        elif score >= 4:
            return 2 # HIGH
        elif score >= 2:
            return 1 # MEDIUM
        else:
            return 0 # LOW
            
    data['risk_level'] = data.apply(calculate_risk, axis=1)
    return data

def train():
    print("Generating synthetic data...")
    df = generate_synthetic_data(2000)
    
    X = df[['age', 'outdoor_job', 'bp_patient', 'temperature', 'aqi']]
    y = df['risk_level']
    
    print("Training Random Forest Classifier...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)
    
    # Save model
    print("Saving model to risk_model.pkl...")
    with open('risk_model.pkl', 'wb') as f:
        pickle.dump(clf, f)
    
    print("Training complete! Model saved successfully.")
    
if __name__ == "__main__":
    train()
