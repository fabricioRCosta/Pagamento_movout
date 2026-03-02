import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Seletor({ titulo, opcoes, valorSelecionado, aoSelecionar }) {
  return (
    <View style={styles.container}>
      {titulo && <Text style={styles.title}>{titulo}</Text>}
      <View style={styles.optionsContainer}>
        {opcoes.map((opcao) => {
          const isSelected = valorSelecionado === opcao;
          return (
            <TouchableOpacity
              key={opcao}
              style={[
                styles.option,
                isSelected && styles.selectedOption
              ]}
              onPress={() => aoSelecionar(opcao)}
            >
              <View style={[styles.radioCircle, isSelected && styles.selectedRadioCircle]}>
                {isSelected && <View style={styles.selectedInnerCircle} />}
              </View>
              <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                {opcao}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedOption: {
    backgroundColor: '#E8F0FE',
    borderColor: '#007BFF',
  },
  radioCircle: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#AAAAAA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selectedRadioCircle: {
    borderColor: '#007BFF',
  },
  selectedInnerCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#007BFF',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedOptionText: {
    color: '#007BFF',
    fontWeight: '600',
  },
});