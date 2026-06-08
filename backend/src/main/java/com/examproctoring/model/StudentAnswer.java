package com.examproctoring.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class StudentAnswer {
    private Long questionId;
    private Integer selectedAnswer;
    
    public StudentAnswer() {}
    
    public StudentAnswer(Long questionId, Integer selectedAnswer) {
        this.questionId = questionId;
        this.selectedAnswer = selectedAnswer;
    }
    
    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    
    public Integer getSelectedAnswer() { return selectedAnswer; }
    public void setSelectedAnswer(Integer selectedAnswer) { this.selectedAnswer = selectedAnswer; }
}