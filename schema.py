#PYTHON SCHEMA
main_schema = {
    'medievalChronicles': {
        'type': 'dict',
        'schema': {
            'chronicles' : {
                'type': 'dict',
                'schema': {
                    'geography': {
                        'type': 'list',
                        'schema': {
                            'country': {
                                'type': 'dict',
                                'schema': {
                                    'region': {
                                        'type': 'string',
                                        'formType': 'select',
                                        'allowed': ['Bohemia', 'Poland', 'Croatia', 'Hungary', 'GDL', 'Russia'],
                                    },
                                    'freeText': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                    }
                                }
                            }
                        },
                        'order': 1
                    },
                    'language': {
                        'type': 'dict',
                        'schema': {
                            'imperial': {
                                'type': 'string',
                                'formType': 'select',
                                'allowed': ['Latin', 'Greek', 'Church Slavonic', 'Hebrew', 'Arabic']
                            },
                            'vernacular': {
                                'type': 'string',
                                'formType': 'select',
                                'allowed': ['English', 'German', 'Czech', 'Polish', 'Croatian', 'Dutch', 'Italian', 'Spanish']
                                # text box?
                            }
                        },
                        'order': 2
                    },
                    'period': {
                        'type': 'string',
                        'required': True,
                        'formType': 'select',
                        'allowed': ['pre-900', '900-950', '950-1000', '1000-1050', '1050-1100', '1100-1150', '1150-1200', '1200-1250', '1250-1300', '1300-1350', '1350-1400', '1400-1450', '1450-1500', 'post-1500'],
                        'order': 3
                    },
                    'sources': {
                        'type': 'dict',
                        'schema': {
                            'sourcesMentioned': {
                                'type': 'dict',
                                'documentation': 'If the author mentions sources, what types are mentioned?',
                                'schema': {
                                    'worksOfClassicalAntiquity': {
                                        'type': 'list',
                                        'schema': {
                                            'type': 'string',
                                            'formType': 'textarea'
                                        },
                                        'order': 1
                                    },
                                    'previousChronicles': {
                                        'type': 'list',
                                        'schema': {
                                            'type': 'string',
                                            'formType': 'textarea'
                                        },
                                        'order': 2
                                    },
                                    'oralAccounts': {
                                        'type': 'list',
                                        'schema': {
                                            'type': 'string',
                                            'formType': 'textarea'
                                        },
                                        'order': 3
                                    },
                                    'witnesses': {
                                        'type': 'list',
                                        'schema': {
                                            'type': 'string',
                                            'formType': 'textarea'
                                        },
                                        'order': 4
                                    },
                                    'documents': {
                                        'type': 'list',
                                        'schema': {
                                            'type': 'string',
                                            'formType': 'textarea'
                                        },
                                        'order': 5
                                    }
                                }
                            }
                        },
                        'order': 4
                    }
                },
                'order': 1
            },
            'content': {
                'type': 'dict',
                'schema': {
                    'biblicalHistory': {
                        'type': 'dict',
                        'schema': {
                            'namesOfIndividuals': {
                                'type': 'list',
                                'schema': {
                                    'type': 'string',
                                },
                                'order': 1
                            },
                            'namesOfGroups': {
                                'type': 'list',
                                'schema': {
                                    'type': 'string',
                                    'formType': 'select',
                                    'allowed': ['', 'Greeks', 'Romans', 'sons of Noah (Shem and Ham)', 'Amazons', 'Huns', 'Avars', 'Scythians']
                                },
                                'order': 2
                            },
                            'events': {
                                'type': 'dict',
                                'schema': {
                                    'flood': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 1
                                    },
                                    'wandering': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 2
                                    },
                                    'followingAnAnimal': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 3
                                    },
                                    'escapingFromPreviousLocation': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 4
                                    },
                                    'comingToADestinedLand': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 5
                                    },
                                    'speechActOfNaming': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 6
                                    }
                                },
                                'order': 3
                            },
                            'places': {
                                'type': 'list',
                                'schema': {
                                    'type': 'string',
                                    'formType': 'textarea'
                                },
                                'order': 4
                            },
                            'conceptsAndGenealogies': {
                                'type': 'dict',
                                'schema': {
                                    'genealogyFromTheTrojans': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 1
                                    },
                                    'confusionOfLanguagesAtTheTowerOfBabel': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 2
                                    },
                                    'genealogyFromNoah\'sSons': {
                                        'type': 'dict',
                                        'schema': {
                                            'japeth': {
                                                'type': 'string',
                                                'formType': 'textarea',
                                                'order': 1
                                            },
                                            'shem': {
                                                'type': 'string',
                                                'formType': 'textarea',
                                                'order': 2
                                            },
                                            'ham': {
                                                'type': 'string',
                                                'formType': 'textarea',
                                                'order': 3
                                            }
                                        },
                                        'order': 3
                                    },
                                    'genealogyFromAnotherBiblicalCharacter': {
                                        'type': 'dict',
                                        'schema': {
                                            'nimrod': {
                                                'type': 'string',
                                                'formType': 'textarea',
                                                'order': 1
                                            },
                                            'gogAndMagog': {
                                                'type': 'string',
                                                'formType': 'textarea',
                                                'order': 2
                                            }
                                        },
                                        'order': 4
                                    },
                                    'genealogyFromTheGreeks': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 5
                                    },
                                    'genealogyFromTheRomans': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 6
                                    }
                                },
                                'order': 5
                            }
                        }
                    },
                    'classicalMyths': {
                        'type': 'dict',
                        'schema': {
                            'namesOfIndividuals': {
                                'type': 'list',
                                'schema': {
                                    'type': 'string',
                                }
                            },
                            'namesOfGroups': {
                                'type': 'list',
                                'schema': {
                                    'type': 'string',
                                    'formType': 'select',
                                    'allowed': ['', 'Greeks', 'Romans', 'sons of Noah (Shem and Ham)', 'Amazons', 'Huns', 'Avars', 'Scythians']
                                }
                            },
                            'events': {
                                'type': 'dict',
                                'schema': {
                                    'flood': {
                                        'type': 'string',
                                        'formType': 'textarea'
                                    },
                                    'wandering': {
                                        'type': 'string',
                                        'formType': 'textarea'
                                    },
                                    'followingAnAnimal': {
                                        'type': 'string',
                                        'formType': 'textarea'
                                    },
                                    'escapingFromPreviousLocation': {
                                        'type': 'string',
                                        'formType': 'textarea'
                                    },
                                    'comingToADestinedLand': {
                                        'type': 'string',
                                        'formType': 'textarea'
                                    },
                                    'speechActOfNaming': {
                                        'type': 'string',
                                        'formType': 'textarea'
                                    }
                                }
                            },
                            'places': {
                                'type': 'list',
                                'schema': {
                                    'type': 'string',
                                    'formType': 'textarea'
                                }
                            },
                            'conceptsAndGenealogies': {
                                'type': 'dict',
                                'schema': {
                                    'genealogyFromTheTrojans': {
                                        'type': 'string',
                                        'formType': 'textarea'
                                    },
                                    'confusionOfLanguagesAtTheTowerOfBabel': {
                                        'type': 'string',
                                        'formType': 'textarea'
                                    },
                                    'genealogyFromNoah\'sSons': {
                                        'type': 'dict',
                                        'schema': {
                                            'japeth': {
                                                'type': 'string',
                                                'formType': 'textarea'
                                            },
                                            'shem': {
                                                'type': 'string',
                                                'formType': 'textarea'
                                            },
                                            'ham': {
                                                'type': 'string',
                                                'formType': 'textarea'
                                            }
                                        }
                                    },
                                    'genealogyFromAnotherBiblicalCharacter': {
                                        'type': 'dict',
                                        'schema': {
                                            'nimrod': {
                                                'type': 'string',
                                                'formType': 'textarea'
                                            },
                                            'gogAndMagog': {
                                                'type': 'string',
                                                'formType': 'textarea'
                                            }
                                        }
                                    },
                                    'genealogyFromTheGreeks': {
                                        'type': 'string',
                                        'formType': 'textarea'
                                    },
                                    'genealogyFromTheRomans': {
                                        'type': 'string',
                                        'formType': 'textarea'
                                    }
                                }
                            }
                        },
                        'order': 2
                    },
                    'localFolkNarratives': {
                        'type': 'dict',
                        'schema': {
                            'namesOfIndividuals': {
                                'type': 'list',
                                'schema': {
                                    'type': 'string',
                                },
                                'order': 1
                            },
                            'namesOfGroups': {
                                'type': 'list',
                                'schema': {
                                    'type': 'string',
                                    'formType': 'select',
                                    'allowed': ['', 'Greeks', 'Romans', 'sons of Noah (Shem and Ham)', 'Amazons', 'Huns', 'Avars', 'Scythians']
                                },
                                'order': 2
                            },
                            'events': {
                                'type': 'dict',
                                'schema': {
                                    'flood': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 1
                                    },
                                    'wandering': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 2
                                    },
                                    'followingAnAnimal': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 3
                                    },
                                    'escapingFromPreviousLocation': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 4
                                    },
                                    'comingToADestinedLand': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 5
                                    },
                                    'speechActOfNaming': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 6
                                    }
                                },
                                'order': 3
                            },
                            'places': {
                                'type': 'list',
                                'schema': {
                                    'type': 'string',
                                    'formType': 'textarea'
                                },
                                'order': 4
                            },
                            'conceptsAndGenealogies': {
                                'type': 'dict',
                                'schema': {
                                    'genealogyFromTheTrojans': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 1
                                    },
                                    'confusionOfLanguagesAtTheTowerOfBabel': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 2
                                    },
                                    'genealogyFromNoah\'sSons': {
                                        'type': 'dict',
                                        'schema': {
                                            'japeth': {
                                                'type': 'string',
                                                'formType': 'textarea',
                                                'order': 1
                                            },
                                            'shem': {
                                                'type': 'string',
                                                'formType': 'textarea',
                                                'order': 2
                                            },
                                            'ham': {
                                                'type': 'string',
                                                'formType': 'textarea',
                                                'order': 3
                                            }
                                        },'order': 3
                                    },
                                    'genealogyFromAnotherBiblicalCharacter': {
                                        'type': 'dict',
                                        'schema': {
                                            'nimrod': {
                                                'type': 'string',
                                                'formType': 'textarea',
                                                'order': 1
                                            },
                                            'gogAndMagog': {
                                                'type': 'string',
                                                'formType': 'textarea',
                                                'order': 2
                                            }
                                        },
                                        'order': 4
                                    },
                                    'genealogyFromTheGreeks': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 5
                                    },
                                    'genealogyFromTheRomans': {
                                        'type': 'string',
                                        'formType': 'textarea',
                                        'order': 6
                                    }
                                },
                                'order': 5
                            },
                            'problemOfIncludingFolkStoriesAndMyths': {
                                'type': 'boolean',
                                'formType': 'checkbox',
                                'required': True,
                                'documentation': 'Does the author talk about the problem of including folk stories and myths?',
                                'order': 6
                            },
                            'inclusionOfFolkStoriesJustified': {
                                'type': 'boolean',
                                'formType': 'checkbox',
                                'required': True,
                                'documentation': 'Is the inclusion of folk stories justified by the author?',
                                'order': 7
                            },
                            'sourcesFrom': {
                                'type': 'dict',
                                'documentation': 'If the sources are mentioned, what are they?',
                                'schema': {
                                    'fromTheStoriesOfElders': {
                                        'type': 'boolean',
                                        'formType': 'checkbox',
                                        'required': True,
                                        'order': 1
                                    },
                                    'fromMinstrelsOrTroubadours': {
                                        'type': 'boolean',
                                        'formType': 'checkbox',
                                        'required': True,
                                        'order': 2
                                    },
                                    'fromOtherChronicles': {
                                        'type': 'boolean',
                                        'formType': 'checkbox',
                                        'required': True,
                                        'order': 3
                                    },
                                    'fromWrittenSources': {
                                        'type': 'boolean',
                                        'formType': 'checkbox',
                                        'required': True,
                                        'order': 4
                                    },
                                    'fromASpecificPerson': {
                                        'type': 'boolean',
                                        'formType': 'checkbox',
                                        'required': True,
                                        'order': 5
                                    }
                                },
                                'order': 8
                            },
                            'originStories': {
                                'type': 'boolean',
                                'formType': 'checkbox',
                                'required': True,
                                'documentation': 'Does the legendary section feature origin stories?',
                                'order': 9
                            },
                            'originEtymologies': {
                                'type': 'boolean',
                                'formType': 'checkbox',
                                'required': True,
                                'documentation': 'If the legendary section features origin stories, do the origin stories feature etymologies?',
                                'order': 10
                            }
                        },
                        'order': 3
                    },
                    'mythsOfOrigin': {
                        'type': 'boolean',
                        'formType': 'checkbox',
                        'required': True,
                        'documentation': 'Are any of these narratives myths of origin?',
                        'order': 4
                    }
                },
                'order': 2
            },
            'authorsAndGoals': {
                'type': 'dict',
                'schema': {
                    'personalInfoAboutAuthor': {
                        'type': 'dict',
                        'schema': {
                            'authorName': {
                                'type': 'string',
                                'documentation': 'If the author\'s name is known, what is it?',
                                'order': 1
                            },
                            'authorNickname': {
                                'type': 'string',
                                'documentation': 'If the author\'s name is not known, what is their nickname (if they have one)?',
                                'order': 2
                            },
                            'authorOccupation': {
                                'type': 'string',
                                'documentation': 'If the author\'s occupation is known, what is it?',
                                'order': 3
                            },
                            'authorEducation': {
                                'type': 'string',
                                'documentation': 'If the author\'s education is known, select one:',
                                'allowed': ['Church/chapter school', 'University'],
                                'formType': 'select',
                                'order': 4
                            },
                            'authorComposed': {
                                'type': 'string',
                                'documentation': 'Has the author composed other works?',
                                'allowed': ['yes', 'no', 'unknown'],
                                'formType': 'select',
                                'order': 5
                            },
                            'otherWorks': {
                                'type': 'string',
                                'documentation': 'If the author has composed other works, what are they?',
                                'order': 6
                            },
                            'educationMentioned': {
                                'type': 'string',
                                'documentation': 'If the author says anything else about his education, what is it?',
                                'formType': 'textarea',
                                'order': 7
                            }
                        },
                        'order': 1
                    },
                    'causaAndModusScribendi': {
                        'type': 'dict',
                        'schema': {
                            'historiansTask': {
                                'type': 'string',
                                'documentation': 'If the author says anything about his understanding of a historian\'s task, what does he say?',
                                'formType': 'textarea',
                                'order': 1
                            },
                            'historianTruth': {
                                'type': 'string',
                                'documentation': 'If the author talks about truth being important for a historian, what does he say?',
                                'formType': 'textarea',
                                'order': 2
                            },
                            'reasonForWriting': {
                                'type': 'string',
                                'documentation': 'If the author gives a reason for writing his work, what does he say?',
                                'formType': 'textarea',
                                'order': 3
                            },
                            'intendedAudience': {
                                'type': 'string',
                                'documentation': 'If the author mentions the intended audience, what does he say?',
                                'formType': 'textarea',
                                'order': 4
                            },
                            'reliabilityOfSources': {
                                'type': 'string',
                                'documentation': 'If the author shows awareness of the reliability of sources, what does he say?',
                                'formType': 'textarea',
                                'order': 5
                            },
                            'importanceOfLanguage': {
                                'type': 'string',
                                'documentation': 'If the author acknowledges the importance of language and/or grammar, what does he say?',
                                'formType': 'textarea',
                                'order': 6
                            },
                            'grammariansOrScholars': {
                                'type': 'string',
                                'documentation': 'If the author refers to grammarians or other scholars, who does he refer to?',
                                'allowed': ['priscian', 'Donatus', 'Isidore'],
                                'formType': 'select',
                                'order': 7
                            },
                            'commentsAboutLanguage': {
                                'type': 'string',
                                'documentation': 'If the author comments about his own language, style, or research skills, what does he say?',
                                'formType': 'textarea',
                                'order': 8
                            },
                            'intellectualVerbs': {
                                'type': 'string',
                                'documentation': 'If the author uses any \'intellectual verbs\' that signify research (\'learn, study\'), what does he say?',
                                'formType': 'textarea',
                                'order': 9
                            },
                            'simplicityOfStyle': {
                                'type': 'string',
                                'documentation': 'If the author mentions simplicity of style as a positive feature, what does he say?',
                                'formType': 'textarea',
                                'order': 10
                            },
                            'clarityOfStyle': {
                                'type': 'string',
                                'documentation': 'If the author mentions clarity of style as a positive feature, what does he say?',
                                'formType': 'textarea',
                                'order': 11
                            },
                            'brevity': {
                                'type': 'string',
                                'documentation': 'If the author mentions brevity as a positive feature, what does he say?',
                                'formType': 'textarea',
                                'order': 12
                            },
                            'styleComparison': {
                                'type': 'list',
                                'documentation': 'If the author compares his work/style to others, who?',
                                'schema': {
                                    'type': 'string',
                                    'allowed': ['Orosius', 'Vergil', 'Augustine', 'Jerome', 'Lucan', 'Sallust', 'Ovid', 'Isidore', 'Diodorus', 'Eusebius'],
                                    'formType': 'select'
                                },
                                'order': 13
                            },
                            'otherHistorians': {
                                'type': 'string',
                                'documentation': 'If the author says anything about other historians or those who might judge him, what does he say?',
                                'formType': 'textarea',
                                'order': 14
                            },
                            'possibilityOfRidicule': {
                                'type': 'string',
                                'documentation': 'If the author mentions a possibility of being ridiculed or laughed at, what does he say?',
                                'formType': 'textarea',
                                'order': 15
                            },
                            'appeal': {
                                'type': 'string',
                                'documentation': 'If the author appeals to his addressee/reader that he/others would finish his task, what does he say?',
                                'formType': 'textarea',
                                'order': 16
                            }
                        }
                    },
                    'order': 2
                },
                'order': 3
            },
            'etymologies': {
                'type': 'list',
                'schema': {
                    'type': 'dict',
                    'documentation': 'If the author etymologizes, for each etymology answer the following questions.',
                    'schema': {
                        'etymologyText': {
                            'type': 'string',
                            'documentation': 'Enter the etymology in the text box.',
                            'formType': 'textarea',
                            'order': 1
                        },
                        'etymologySection': {
                            'type': 'string',
                            'documentation': 'In what section does this etymology occur?',
                            'allowed': ['preface/dedication', 'biblical section', 'folk history section', 'distant documented past', 'recent documented past', 'very recent/present'],
                            'formType': 'select',
                            'order': 2
                        },
                        'etymologyType': {
                            'type': 'string',
                            'documentation': 'What kind of etymology is it?',
                            'allowed': ['person name', 'ruler name', 'ethnonym', 'country name', 'city name', 'river name', 'place name (mountain, forest region, etc.)', 'quality or description (action verb, adjective)', 'social custom'],
                            'formType': 'select',
                            'order': 3
                        },
                        'etymologyDeviation': {
                            'type': 'string',
                            'documentation': 'Deviation according to Isidore',
                            'allowed': ['ex origo', 'ex causa', 'ex contrario'],
                            'formType': 'select',
                            'order': 4
                        },
                        'etymologyLanguage': {
                            'type': 'dict',
                            'schema': {
                                'sourceLanguage': {
                                    'type': 'string',
                                    'documentation': 'Etymology\'s source language',
                                    'allowed': ['Latin', 'Greek', 'Hebrew', 'Vernacular'],
                                    'formType': 'select',
                                    'order': 1
                                },
                                'vernacularLanguage': {
                                    'type': 'string',
                                    'documentation': 'If the source language is vernacular, which type is it?',
                                    'order': 2
                                }
                            },
                            'order': 5
                        },
                        'originalEtymology': {
                            'type': 'string',
                            'documentation': 'If the etymology is not original, what is the source?',
                            'formType': 'textarea',
                            'order': 6
                        },
                        'relatedNarratives': {
                            'type': 'string',
                            'documentation': 'If the etymology has a related story/narrative, summarize the plot.',
                            'formType': 'textarea',
                            'order': 7
                        },
                        'speechAct': {
                            'type': 'string',
                            'documentation': 'If the etymology involves a speech act, detail it.',
                            'formType': 'textarea',
                            'order': 8
                        }
                    
                    }
                },
                'order': 4
            }
        }
    }
} 
