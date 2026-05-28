import re

with open('app/leaves/page.tsx', 'r') as f:
    content = f.read()

# 1. Leave Type Select
content = content.replace("""                            <Select
                              value={form.leave_type_id}
                              label="Leave type *"
                              onChange={(e) => setForm({ ...form, leave_type_id: e.target.value })}
                              required""", """                            <Controller
                              name="leave_type_id"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  label="Leave type *"
                                  error={!!errors.leave_type_id}""")
content = content.replace("""                              {leaveTypes.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                  {type.name}
                                </MenuItem>
                              ))}
                            </Select>""", """                              {leaveTypes.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                  {type.name}
                                </MenuItem>
                              ))}
                            </Select>
                            )}
                          />""")

# 2. Start Date
content = content.replace("""                            <TextField
                              type="date"
                              value={form.start_date}
                              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                              fullWidth
                              size="small"
                              required""", """                            <Controller
                              name="start_date"
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  type="date"
                                  fullWidth
                                  size="small"
                                  error={!!errors.start_date}
                                  helperText={errors.start_date?.message}""")
content = content.replace("""                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                              Session""", """                                },
                              }}
                            />
                            )}
                          />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                              Session""")

# 3. Session From
content = content.replace("""                              <Select
                                value={form.session_from}
                                onChange={(e) => setForm({ ...form, session_from: e.target.value })}""", """                              <Controller
                                name="session_from"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}""")
content = content.replace("""                                <MenuItem value="Session 1">Session 1</MenuItem>
                                <MenuItem value="Session 2">Session 2</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>

                        {/* To Date Row */""", """                                <MenuItem value="Session 1">Session 1</MenuItem>
                                <MenuItem value="Session 2">Session 2</MenuItem>
                              </Select>
                              )}
                            />
                            </FormControl>
                          </Grid>
                        </Grid>

                        {/* To Date Row */""")

# 4. End Date
content = content.replace("""                            <TextField
                              type="date"
                              value={form.end_date}
                              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                              fullWidth
                              size="small"
                              required""", """                            <Controller
                              name="end_date"
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  type="date"
                                  fullWidth
                                  size="small"
                                  error={!!errors.end_date}
                                  helperText={errors.end_date?.message}""")
content = content.replace("""                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                              Session
                            </Typography>
                            <FormControl fullWidth size="small">
                              <Select
                                value={form.session_to}""", """                                },
                              }}
                            />
                            )}
                          />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                              Session
                            </Typography>
                            <FormControl fullWidth size="small">
                              <Controller
                                name="session_to"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    error={!!errors.session_to}""")
content = content.replace("""                                <MenuItem value="Session 1">Session 1</MenuItem>
                                <MenuItem value="Session 2">Session 2</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>

                        {/* Leave Balance Info */""", """                                <MenuItem value="Session 1">Session 1</MenuItem>
                                <MenuItem value="Session 2">Session 2</MenuItem>
                              </Select>
                              )}
                            />
                            </FormControl>
                          </Grid>
                        </Grid>

                        {/* Leave Balance Info */""")

# 5. Contact Details
content = content.replace("""                          <TextField
                            value={form.contact_details}
                            onChange={(e) => setForm({ ...form, contact_details: e.target.value })}
                            placeholder="Enter your contact details"
                            fullWidth
                            multiline
                            rows={2}""", """                          <Controller
                            name="contact_details"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                placeholder="Enter your contact details"
                                fullWidth
                                multiline
                                rows={2}
                                error={!!errors.contact_details}
                                helperText={errors.contact_details?.message}""")
content = content.replace("""                              },
                            }}
                          />
                        </Box>

                        {/* Reason */""", """                              },
                            }}
                          />
                          )}
                        />
                        </Box>

                        {/* Reason */""")

# 6. Reason
content = content.replace("""                          <TextField
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            placeholder="Enter a reason"
                            fullWidth
                            multiline
                            rows={3}""", """                          <Controller
                            name="reason"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                placeholder="Enter a reason"
                                fullWidth
                                multiline
                                rows={3}
                                error={!!errors.reason}
                                helperText={errors.reason?.message}""")
content = content.replace("""                              },
                            }}
                          />
                        </Box>

                        {/* File Upload */""", """                              },
                            }}
                          />
                          )}
                        />
                        </Box>

                        {/* File Upload */""")


with open('app/leaves/page.tsx', 'w') as f:
    f.write(content)

