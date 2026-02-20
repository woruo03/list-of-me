use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum Status {
    Todo,
    Doing,
    Done,
}

impl Status {
    pub fn as_str(&self) -> &'static str {
        match self {
            Status::Todo => "todo",
            Status::Doing => "doing",
            Status::Done => "done",
        }
    }
}

impl fmt::Display for Status {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

impl From<&str> for Status {
    fn from(s: &str) -> Self {
        match s {
            "doing" => Status::Doing,
            "done" => Status::Done,
            _ => Status::Todo,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: i64,
    pub project_id: Option<i64>,
    pub title: String,
    pub description: Option<String>,
    pub status: Status,
    pub due_at: Option<DateTime<Utc>>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: i64,
    pub name: String,
}

#[derive(serde::Deserialize)]
pub struct TaskCreate {
    pub project_id: Option<i64>,
    pub title: String,
    pub description: Option<String>,
    pub status: Status,
    pub due_at: Option<DateTime<Utc>>,
    pub notes: Option<String>,
}

#[derive(serde::Deserialize)]
pub struct TaskUpdate {
    pub project_id: Option<Option<i64>>,
    pub title: Option<String>,
    pub description: Option<Option<String>>,
    pub status: Option<Status>,
    pub due_at: Option<Option<DateTime<Utc>>>,
    pub notes: Option<Option<String>>,
}

#[derive(serde::Deserialize, Default)]
pub struct TaskFilter {
    pub project_id: Option<Option<i64>>, // Some(None) means Inbox (NULL)
    pub status: Option<Status>,
}

pub struct Summary {
    pub inbox_count: i64,
    pub today_count: i64,
}
