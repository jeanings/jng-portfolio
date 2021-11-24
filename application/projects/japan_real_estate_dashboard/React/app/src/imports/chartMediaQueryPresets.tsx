    /* ==============================================
                Media query constants
    ============================================== */
    export const chartConfigs = {
        'line': {
            'elements': {
                'line': {
                    'borderWidth': {
                        'isPortrait': 3,
                        'isPortableLandscape': 3,
                        'isScreen1080': 3,
                        'isScreen1440': 5,
                        'isScreen4k': 8,
                        'fallback': 3
                    }
                },
                'point': {
                    'radius': {
                        'isPortrait': 6,
                        'isPortableLandscape': 6,
                        'isScreen1080': 7,
                        'isScreen1440': 11,
                        'isScreen4k': 18,
                        'fallback': 7
                    },
                    'borderWidth': {
                        'isPortrait': 1,
                        'isPortableLandscape': 1,
                        'isScreen1080': 1,
                        'isScreen1440': 2,
                        'isScreen4k': 3,
                        'fallback': 1
                    },
                    'hoverBorderWidth': {
                        'isPortrait': 3,
                        'isPortableLandscape': 3,
                        'isScreen1080': 3,
                        'isScreen1440': 5,
                        'isScreen4k': 8,
                        'fallback': 3
                    },
                    'hoverRadius': {
                        'isPortrait': 11,
                        'isPortableLandscape': 11,
                        'isScreen1080': 12,
                        'isScreen1440': 18,
                        'isScreen4k': 30,
                        'fallback': 12
                    },
                    'hitRadius': {
                        'isPortrait': 7,
                        'isPortableLandscape': 7,
                        'isScreen1080': 8,
                        'isScreen1440': 12,
                        'isScreen4k': 20,
                        'fallback': 8
                    }
                }
            },
            'scales': {
                'x': {
                    'tickSize': {
                        'isPortrait': 11,
                        'isPortableLandscape': 11,
                        'isScreen1080': 13,
                        'isScreen1440': 20,
                        'isScreen4k': 33,
                        'fallback': 13
                    }
                },
                'y': {
                    'tickSize': {
                        'isPortrait': 11,
                        'isPortableLandscape': 11,
                        'isScreen1080': 13,
                        'isScreen1440': 20,
                        'isScreen4k': 33,
                        'fallback': 13
                         
                    }
                }
            },
            'plugins': {
                'title': {
                    'paddingBottom': {
                        'isPortrait': 18,
                        'isPortableLandscape': 18,
                        'isScreen1080': 20,
                        'isScreen1440': 30,
                        'isScreen4k': 50,
                        'fallback': 20
                    },
                    'fontSize': {
                        'isPortrait': 21,
                        'isPortableLandscape': 21,
                        'isScreen1080': 24,
                        'isScreen1440': 36,
                        'isScreen4k': 60,
                        'fallback': 24
                    }
                },
                'legend': {
                    'labels': {
                        'padding': {
                            'isPortrait': 13,
                            'isPortableLandscape': 13,
                            'isScreen1080': 15,
                            'isScreen1440': 23,
                            'isScreen4k': 38,
                            'fallback': 15
                        },
                        'box': {
                            'height': {
                                'isPortrait': 11,
                                'isPortableLandscape': 11,
                                'isScreen1080': 13,
                                'isScreen1440': 20,
                                'isScreen4k': 33,
                                'fallback': 13
                            },
                            'width': {
                                'isPortrait': 26,
                                'isPortableLandscape': 26,
                                'isScreen1080': 30,
                                'isScreen1440': 45,
                                'isScreen4k': 75,
                                'fallback': 30
                            }
                        },
                        'fontSize': {
                            'isPortrait': 15,
                            'isPortableLandscape': 15,
                            'isScreen1080': 17,
                            'isScreen1440': 26,
                            'isScreen4k': 43,
                            'fallback': 17
                        }
                    }
                },
                'tooltip': {
                    'caret': {
                        'size': {
                            'isPortrait': 7,
                            'isPortableLandscape': 7,
                            'isScreen1080': 8,
                            'isScreen1440': 12,
                            'isScreen4k': 20,
                            'fallback': 8
                        },
                        'padding': {
                            'isPortrait': 9,
                            'isPortableLandscape': 9,
                            'isScreen1080': 10,
                            'isScreen1440': 15,
                            'isScreen4k': 25,
                            'fallback': 10
                        }
                    },
                    'cornerRadius': {
                        'isPortrait': 3,
                        'isPortableLandscape': 3,
                        'isScreen1080': 3,
                        'isScreen1440': 5,
                        'isScreen4k': 8,
                        'fallback': 3
                    },
                    'padding': {
                        'isPortrait': 9,
                        'isPortableLandscape': 9,
                        'isScreen1080': 10,
                        'isScreen1440': 15,
                        'isScreen4k': 25,
                        'fallback': 10
                    },
                    'titleFontSize': {
                        'isPortrait': 13,
                        'isPortableLandscape': 13,
                        'isScreen1080': 15,
                        'isScreen1440': 23,
                        'isScreen4k': 38,
                        'fallback': 15
                    },
                    'bodyFontSize': {
                        'isPortrait': 13,
                        'isPortableLandscape': 13,
                        'isScreen1080': 14,
                        'isScreen1440': 21,
                        'isScreen4k': 35,
                        'fallback': 14
                    }
                }
            }
        },
        'bar': {
            'scales': {
                'x': {
                    'tickSize': {
                        'isPortrait': 11,
                        'isPortableLandscape': 11,
                        'isScreen1080': 13,
                        'isScreen1440': 20,
                        'isScreen4k': 33,
                        'fallback': 13
                    }
                },
                'y': {
                    'tickSize': {
                        'isPortrait': 11,
                        'isPortableLandscape': 11,
                        'isScreen1080': 13,
                        'isScreen1440': 20,
                        'isScreen4k': 33,
                        'fallback': 13
                    }
                }
            },
            'plugins': {
                'title': {
                    'padding': {
                        'top': {
                            'isPortrait': 18,
                            'isPortableLandscape': 18,
                            'isScreen1080': 20,
                            'isScreen1440': 30,
                            'isScreen4k': 50,
                            'fallback': 20
                        },
                        'bottom': {
                            'isPortrait': 18,
                            'isPortableLandscape': 18,
                            'isScreen1080': 20,
                            'isScreen1440': 30,
                            'isScreen4k': 50,
                            'fallback': 20
                        }
                    },
                    'fontSize': {
                        'isPortrait': 21,
                        'isPortableLandscape': 21,
                        'isScreen1080': 24,
                        'isScreen1440': 36,
                        'isScreen4k': 60,
                        'fallback': 24
                    }
                },
                'tooltip': {
                    'caretSize': {
                        'isPortrait': 7,
                        'isPortableLandscape': 7,
                        'isScreen1080': 8,
                        'isScreen1440': 12,
                        'isScreen4k': 20,
                        'fallback': 8
                    },
                    'cornerRadius': {
                        'isPortrait': 3,
                        'isPortableLandscape': 3,
                        'isScreen1080': 3,
                        'isScreen1440': 5,
                        'isScreen4k': 8,
                        'fallback': 3
                    },
                    'padding': {
                        'isPortrait': 9,
                        'isPortableLandscape': 9,
                        'isScreen1080': 10,
                        'isScreen1440': 15,
                        'isScreen4k': 25,
                        'fallback': 10
                    },
                    'titleFontSize': {
                        'isPortrait': 13,
                        'isPortableLandscape': 13,
                        'isScreen1080': 15,
                        'isScreen1440': 23,
                        'isScreen4k': 38,
                        'fallback': 15
                    },
                    'bodyFontSize': {
                        'isPortrait': 12,
                        'isPortableLandscape': 12,
                        'isScreen1080': 14,
                        'isScreen1440': 21,
                        'isScreen4k': 35,
                        'fallback': 14
                    },
                    'footerFontSize': {
                        'isPortrait': 12,
                        'isPortableLandscape': 12,
                        'isScreen1080': 14,
                        'isScreen1440': 21,
                        'isScreen4k': 35,
                        'fallback': 14
                    }
                }
            }
        }
    }





    export const widthToFontSize: ChartMediaQueryPreset = { // Add 'px' to end
        'isPortrait': 18,
        'isPortableLandscape': 22,
        'isScreen1080': 24,
        'isScreen1440': 32,
        'isScreen4k': 52,
        'fallback': 30
    };

    export const widthToLineSpacing: ChartMediaQueryPreset = {
        'isPortrait': 30,
        'isPortableLandscape': 30,
        'isScreen1080': 35,
        'isScreen1440': 40,
        'isScreen4k': 65,
        'fallback': 35
    };


    type ChartMediaQueryPreset = {
        isPortrait: number,
        isPortableLandscape: number,
        isScreen1080: number,
        isScreen1440: number,
        isScreen4k: number,
        fallback: number
    };