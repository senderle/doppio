#PYTHON SCHEMA
main_schema = {
    'ephemeralRecord' : {
        'type': 'dict',
        'schema': {
            'archiveHoldingDocument': {
                'type': 'string',
                'maxlength': 700,
                'documentation': ("The name of the library or archive that holds "
                                  "the document.")
            },
            'callNumber': {
                'type': 'string',
                'required': True,
                'maxlength': 700,
                'documentation': ("The call number of the document as specified by "
                                  "the holding institution.")
            },
            'containingCollection': {
                'type': 'string',
                'maxlength': 700,
                'documentation': "The name of the collection the document resides in."
            },
            'dataCataloger': {
                'type': 'string',
                'maxlength': 700,
                'documentation': ("Your unique identifier as a cataloger. May be your "
                                  "name, your initials, or some other unique word or "
                                  "phrase of your choice.")
            },
            'dimensions': {
                'type': 'dict',
                'schema': {
                    'length': {
                        'type': 'number',
                        'documentation': "The length of the document in centimeters."
                    },
                    'width': {
                        'type': 'number',
                        'documentation': "The width of the document in centimeters."
                    }
                }
            },
            'documentType': {
                'type': 'string',
                'formType': 'select',
                'allowed': ['', 'Playbill', 'London Stage',
                            'Yorkshire Stage', 'Other Compendia',
                            'Periodical Advertisement', 'Periodical Review'],
                'maxlength': 700,
                'documentation': ("The document type. One of Playbill / London Stage "
                                  "/ Yorkshire Stage / Other Compendia / Periodical "
                                  "Advertisement / Periodical Review")
            },
            'pageNumber': {
                'type': 'string', # account for Roman numerals?
                'documentation': ("If the record is contained in another paginated "
                                  "document, the starting page of the record in that "
                                  "document.")
            },
            'periodicalTitle': {
                'type': 'string',
                'maxlength': 700,
                'documentation': ("The name of the containing periodical (e.g. for "
                                  "advertisements). We may develop a controlled "
                                  "vocabulary for this.")
            },
            'persistentUrl': {
                'type': 'string',
                'maxlength': 700,
                'documentation': ("A persistent URL where identifying information "
                                  "about the document may be found.")
            },
            'printedArea': {
                'type': 'dict',
                'schema': {
                    'length': {
                        'type': 'number',
                        'documentation': "The length of the printed area in centimeters."
                    },
                    'width': {
                        'type': 'number',
                        'documentation': "The width of the printed area in centimeters."
                    }
                }
            },
            'announcements': {
                'type': 'list',
                'schema': {
                    'type': 'string',
                    'formType': 'textarea',
                    'maxlength': 3000,
                    'documentation': ("The text of each announcement, as given by "
                                      "the document, to be entered at the discretion "
                                      "of the cataloger.")
                }
            },
            'documentPrinter': {
                'type': 'dict',
                'schema': {
                    'location': {
                        'type': 'string',
                        'maxlength': 700,
                        'documentation': "The name of the printer."
                    },
                    'name': {
                        'type': 'string',
                        'maxlength': 700,
                        'documentation': "The city where the document was printed."
                    }
                }
            },

            ################################ shows!

            'shows': {
                'type': 'list',
                'schema': {
                    'type': 'dict',
                    'schema': {
                        'date': {
                            'type': 'datetime',
                            'formType': 'date',
                            'nullable': True,
                            'documentation': ("The exact date of the performance. "
                                             "For ranges of dates, create a separate Show "
                                             "Record for each date.")
                        },
                        'doorsOpen': {
                            'type': 'string', # or datetime?
                            'maxlength': 700,
                            'documentation': ("The time when doors open, if listed, using "
                                             "a 24-hour clock.")
                        },
                        'location': {
                            'type': 'string',
                            'maxlength': 700,
                            'documentation': ("The geographical location of the performance, "
                                             "exactly as given by the document.")
                        },
                        'performanceBegins': {
                            'type': 'string',
                            'maxlength': 700,
                            'documentation': ("The time when the performance begins, "
                                             "using a 24-hour clock.")
                        },
                        'theaterCompany': {
                            'type': 'string',
                            'maxlength': 700,
                            'documentation': ("The name of the theater company, exactly "
                                             "as given by the document.")
                        },
                        'stageManager': {
                            'type': 'string',
                            'maxlength': 700,
                            'documentation': ("The name of the stage manager, if present "
                                             "in the document, exactly as given.")
                        },
                        'venue': {
                            'type': 'string',
                            'maxlength': 700,
                            'documentation': ("The venue of the performance, exactly as "
                                             "given by the document.")
                        },
                        'featuredAttractionsForShow': {
                            'type': 'list',
                            'schema': {
                                'type': 'string',
                                'maxlength': 3000,
                                'documentation': ("Any featured attractions described in the "
                                                 "document, exactly as given.")
                            }
                        },
                        'notes': {
                            'type': 'list',
                            'schema': {
                                'type': 'string',
                                'formType': 'textarea',
                                'maxlength': 3000,
                                'documentation': ("Notes describing compelling or otherwise "
                                                 "important details from the document that "
                                                 "will not be captured by any other field.")
                            }
                        },
                        'occasions': {
                            'type': 'list',
                            'schema': {
                                'type': 'dict',
                                'schema': {
                                    'occasionAsStated': {
                                        'type': 'string',
                                        'maxlength': 700,
                                        'documentation': ("The occasion for an occasional "
                                                         "performance, exactly as given "
                                                         "by the document.")
                                    },
                                    'occasionType': {
                                        'type': 'string',
                                        'formType': 'select',
                                        'allowed': ["", "Command Performance",
                                                    "Benefit Performance",
                                                    "Charitable Benefit Performance",
                                                    "Occasional Performance"],
                                        'maxlength': 700,
                                        'documentation': ("The type of occasional performance. "
                                                         "One of Command performance / "
                                                         "Benefit Performance / Charitable "
                                                         "Benefit Performance / Occasional "
                                                         "Performance.")
                                    },
                                    'beneficiary': {
                                        'type': 'list',
                                        'schema': {
                                            'type': 'string',
                                            'maxlength': 700,
                                            'documentation': ("One or more people, ideally "
                                                             "denoted by URIs from a "
                                                             "controlled vocabulary.")
                                            #'dependencies': {
                                            #    'occasionType': {
                                            #        ['Benefit Performance', 'Charitable Benefit \
                                            #        Performance']
                                            #    }
                                            #}
                                        }
                                    },
                                    'occasioner': {
                                        'type': 'list',
                                        'schema': {
                                            'type': 'string',
                                            'maxlength': 700,
                                            'documentation': ("One or more people, ideally "
                                                              "denoted by URIs from a "
                                                              "controlled vocabulary.")
                                            #'dependencies': {
                                            #    'occasionType': {
                                            #        ['Command Performance',
                                            #          'Occasional Performance']
                                            #    }
                                            #}
                                        }
                                    }
                                }
                            }
                        },
                        'performances': {
                            'type': 'list',
                            'schema': {
                                'type': 'dict',
                                'schema': {
                                    'orderOfPerformance': {
                                        'order': 1,
                                        'type': 'integer',
                                        'nullable': True,
                                        'documentation': ("An integer describing the position "
                                                          "of this performance within the "
                                                          "larger show. Starts at 1. "
                                                          "Interpolations should be numbered in "
                                                          "order, and are assumed to occur "
                                                          "within the last full piece listed.")
                                    },
                                    'title': {
                                        'order': 2,
                                        'type': 'string',
                                        'maxlength': 700,
                                        'documentation': ("The title of the work being "
                                                          "performed, exactly as given by the "
                                                          "document.")
                                    },
                                    'timePerformedInSeason': {
                                        'order': 3,
                                        'type': 'integer',
                                        'nullable': True,
                                        'documentation': ("The number of times this play has "
                                                          "been performed in the current season. "
                                                          "E.g. when a playbill announces \"for "
                                                          "the third time this season\" enter 3. ")
                                    },
                                    'playbillGenreClaim': {
                                        'order': 4,
                                        'type': 'string',
                                        'maxlength': 700,
                                        'documentation': ("The genre claim, exactly as given "
                                                          "by the document.")
                                    },
                                    'ourGenreAttribution': {
                                        'order': 5,
                                        'type': 'list',
                                        'schema': {
                                            'type': 'string',
                                            'formType': 'select',
                                            'allowed': [
                                                '',
                                                'Address',
                                                'Ballet',
                                                'Burlesque',
                                                'Burletta',
                                                'Comedy',
                                                'Comic Opera',
                                                'Drama',
                                                'Farce',
                                                'Interlude',
                                                'Melodrama',
                                                'Opera',
                                                'Pantomime',
                                                'Play',
                                                'Tragedy',
                                            ],
                                            'maxlength': 700,
                                            'documentation': ("The genre tag assigned to this play. Whereas "
                                                              "\"Genre Claim\" records the playbill's claim "
                                                              "about a given play's genre, this category reflects "
                                                              "the cataloger's judgment, and provides a controlled "
                                                              "genre vocabulary.")
                                        },
                                    },
                                    'contributors': {
                                        'order': 6,
                                        'type': 'list',
                                        'schema': {
                                            'type': 'dict',
                                            'schema': {
                                                'contributorName': {
                                                    'type': 'string',
                                                    'maxlength': 700,
                                                    'documentation': ("The name of the "
                                                                     "contributor.")
                                                },
                                                'contributorType': {
                                                    'type': 'string',
                                                    'maxlength': 700,
                                                    'documentation': ("The type of "
                                                                      "contributor e.g. Scene "
                                                                      "Painter, Director, "
                                                                      "etc.")
                                                    #'allowed': ["Playwright", "Composer",
                                                    #            "Scene Painter",
                                                    #            "Dance Master",
                                                    #            "Set Designer"]
                                                }
                                            }
                                        }
                                    },
                                    'featuredAttractions': {
                                        'order': 7,
                                        'type': 'list',
                                        'schema': {
                                            'type': 'dict',
                                            'schema': {
                                                'attraction': {
                                                    'type': 'string',
                                                    'maxlength': 3000,
                                                    'documentation': ("Any featured "
                                                                      "attractions described "
                                                                      "in the document, "
                                                                      "exactly as given.")
                                                },
                                                'isInterpolation': {
                                                    'type': 'boolean',
                                                    'required': True,
                                                    'formType': 'checkbox',
                                                    'documentation': ("An indicator set to "
                                                                      "true if the document "
                                                                      "identifies this as an "
                                                                      "interpolation within "
                                                                      "the larger performance.")
                                                }
                                            }
                                        }
                                    },
                                    'performers': {
                                        'order': 8,
                                        'type': 'list',
                                        'schema': {
                                            'type': 'dict',
                                            'schema': {
                                                'performerName': {
                                                    'type': 'string',
                                                    'maxlength': 700,
                                                    'documentation': ("The name of the "
                                                                      "performer.")
                                                },
                                                'roleNotes': {
                                                    'type': 'string',
                                                    'maxlength': 700,
                                                    'documentation': ("Notes on the role or "
                                                                      "performer, exactly as "
                                                                      "given by the document.")
                                                },
                                                'role': {
                                                    'type': 'string',
                                                    'maxlength': 700,
                                                    'documentation': ("The name of the "
                                                                      "performer's role.")
                                                },
                                                'newPerformerNotes': {
                                                    'type': 'dict',
                                                    'schema': {
                                                        'newPerformer': {
                                                            'type': 'boolean',
                                                            'formType': 'checkbox',
                                                            'documentation': ("An indicator "
                                                                              "set to true if "
                                                                              "the document "
                                                                              "identifies this "
                                                                              "as the "
                                                                              "performer's "
                                                                              "first "
                                                                              "appearance at "
                                                                              "this venue.")
                                                        },
                                                        'newPerformerOrigin': {
                                                            'type': 'string',
                                                            'maxlength': 700,
                                                            'documentation': ("The performer's "
                                                                              "previous venue, "
                                                                              "if given by the "
                                                                              "document, and if "
                                                                              "the document "
                                                                              "identifies this "
                                                                              "as the "
                                                                              "performer's "
                                                                              "first "
                                                                              "appearance at "
                                                                              "this venue.")
                                                        },
                                                        'newRole': {
                                                            'type': 'boolean',
                                                            'formType': 'checkbox',
                                                            'documentation': ("An indicator "
                                                                              "set to true if "
                                                                              "the document "
                                                                              "identifies this "
                                                                              "as the "
                                                                              "performer's "
                                                                              "first "
                                                                              "appearance in "
                                                                              "this role.")
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'ticketing': {
                            'type': 'dict',
                            'schema': {
                                'currency': {
                                    'order': 1,
                                    'type': 'string',
                                    'maxlength': 700,
                                    'documentation': ("The national currency in use. Currently "
                                                      "one of UK / US.")
                                },
                                'boxPrice': {
                                    'order': 2,
                                    'type': 'number', # could also be float or integer
                                    'nullable': True,
                                    'documentation': ("The cost of a box seat, as measured "
                                                      "using the smallest possible unit of "
                                                      "currency.")
                                },
                                'secondBoxPrice': {
                                    'order': 3,
                                    'type': 'number',
                                    'nullable': True,
                                    'documentation': ("The cost of a second box seat, as "
                                                      "measured using the smallest possible "
                                                      "unit of currency.")
                                },
                                'upperBoxPrice': {
                                    'order': 4,
                                    'type': 'number', # could also be float or integer
                                    'nullable': True,
                                    'documentation': ("The cost of a box seat, as measured "
                                                      "using the smallest possible unit of "
                                                      "currency.")
                                },
                                'secondUpperBoxPrice': {
                                    'order': 5,
                                    'type': 'number',
                                    'nullable': True,
                                    'documentation': ("The cost of a second box seat, as "
                                                      "measured using the smallest possible "
                                                      "unit of currency.")
                                },
                                'pitPrice': {
                                    'order': 6,
                                    'type': 'number',
                                    'nullable': True,
                                    'documentation': ("The cost of a pit seat, as measured "
                                                      "using the smallest possible unit "
                                                      "of currency.")
                                },
                                'secondPitPrice': {
                                    'order': 7,
                                    'type': 'number',
                                    'nullable': True,
                                    'documentation': ("The cost of a second pit seat, as "
                                                      "measured using the smallest possible "
                                                      "unit of currency.")
                                },
                                'galleryPrice': {
                                    'order': 8,
                                    'type': 'number',
                                    'nullable': True,
                                    'documentation': ("The cost of a second pit seat, as "
                                                      "measured using the smallest possible "
                                                      "unit of currency.")
                                },
                                'secondGalleryPrice': {
                                    'order': 9,
                                    'type': 'number',
                                    'nullable': True,
                                    'documentation': ("The cost of a second gallery seat, as "
                                                      "measured using the smallest possible "
                                                      "unit of currency.")
                                },
                                'upperGalleryPrice': {
                                    'order': 10,
                                    'type': 'number',
                                    'nullable': True,
                                    'documentation': ("The cost of a upper gallery seat, as "
                                                      "measured using the smallest possible "
                                                      "unit of currency.")
                                },
                                'secondUpperGalleryPrice': {
                                    'order': 11,
                                    'type': 'number',
                                    'nullable': True,
                                    'documentation': ("The cost of a second upper gallery seat, "
                                                      "as measured using the smallest possible "
                                                      "unit of currency.")
                                },
                                'toBeHad': {
                                    'order': 12,
                                    'type': 'string',
                                    'maxlength': 700,
                                    'documentation': ("The name of the ticketing agent or "
                                                      "agents.")
                                },
                                'ticketingNotes': {
                                    'order': 13,
                                    'type': 'string',
                                    'maxlength': 700,
                                    'documentation': ("Additional notes about ticketing.")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
